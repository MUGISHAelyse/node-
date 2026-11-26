<?php
// Shopwise API for XAMPP (PHP + MySQLi). Configure database credentials below.
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
$allowedOrigin = 'http://localhost:5173';
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: ' . $allowedOrigin);
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
session_set_cookie_params(['samesite' => 'Lax', 'httponly' => true, 'secure' => false]);
session_start();

try {
  $db = new mysqli('localhost', 'root', '', 'shopwise_ai');
  $db->set_charset('utf8mb4');
  $route = $_GET['route'] ?? '';
  $method = $_SERVER['REQUEST_METHOD'];
  $input = json_decode(file_get_contents('php://input'), true) ?? [];
  function reply($data, $status = 200) { http_response_code($status); echo json_encode($data, JSON_UNESCAPED_UNICODE); exit; }
  function currentUser($db) {
    if (empty($_SESSION['user_id'])) return null;
    $stmt = $db->prepare('SELECT id,name,email,role,blocked,DATE(created_at) joined FROM users WHERE id=?');
    $stmt->bind_param('i', $_SESSION['user_id']); $stmt->execute();
    $u = $stmt->get_result()->fetch_assoc();
    if (!$u || $u['blocked']) return null;
    $u['blocked'] = (bool)$u['blocked']; return $u;
  }
  function requireAdmin($db) { $u = currentUser($db); if (!$u || $u['role'] !== 'admin') reply(['error'=>'Administrator access required.'], 403); return $u; }

  if ($route === 'products' && $method === 'GET') {
    $result = $db->query('SELECT id,name,category,price,stock,emoji,image,description FROM products ORDER BY id');
    $rows = [];
    while ($p = $result->fetch_assoc()) { $p['id']=(string)$p['id']; $p['price']=(float)$p['price']; $p['stock']=(int)$p['stock']; $p['rating']=0; if (!$p['image']) unset($p['image']); $rows[]=$p; }
    reply(['products'=>$rows]);
  }
  if ($route === 'products' && $method === 'POST') {
    requireAdmin($db); $name=trim($input['name']??''); $category=trim($input['category']??''); $price=(float)($input['price']??0); $stock=(int)($input['stock']??0); $emoji=trim($input['emoji']??'📦'); $description=trim($input['description']??''); $image=$input['image']??null;
    if ($name==='' || $category==='' || $price<0 || $stock<0 || $description==='') reply(['error'=>'Please provide valid product details.'],422);
    $stmt=$db->prepare('INSERT INTO products(name,category,price,stock,emoji,image,description) VALUES(?,?,?,?,?,?,?)'); $stmt->bind_param('ssdisss',$name,$category,$price,$stock,$emoji,$image,$description); $stmt->execute(); reply(['id'=>(string)$db->insert_id,'ok'=>true],201);
  }
  if ($route === 'products' && $method === 'PUT') {
    requireAdmin($db); $id=(int)($input['id']??0); $name=trim($input['name']??''); $category=trim($input['category']??''); $price=(float)($input['price']??0); $stock=(int)($input['stock']??0); $emoji=trim($input['emoji']??'📦'); $description=trim($input['description']??''); $image=$input['image']??null;
    $stmt=$db->prepare('UPDATE products SET name=?,category=?,price=?,stock=?,emoji=?,image=?,description=? WHERE id=?'); $stmt->bind_param('ssdisssi',$name,$category,$price,$stock,$emoji,$image,$description,$id); $stmt->execute(); reply(['ok'=>true]);
  }
  if ($route === 'products' && $method === 'DELETE') { requireAdmin($db); $id=(int)($_GET['id']??0); $stmt=$db->prepare('DELETE FROM products WHERE id=?'); $stmt->bind_param('i',$id); $stmt->execute(); reply(['ok'=>true]); }

  if ($route === 'signup' && $method === 'POST') {
    $name=trim($input['name']??''); $email=strtolower(trim($input['email']??'')); $password=$input['password']??'';
    if (mb_strlen($name)<2 || !filter_var($email,FILTER_VALIDATE_EMAIL) || strlen($password)<6) reply(['error'=>'Enter a valid name, email and password (at least 6 characters).'],422);
    $hash=password_hash($password,PASSWORD_DEFAULT);
    try { $stmt=$db->prepare("INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,'customer')"); $stmt->bind_param('sss',$name,$email,$hash); $stmt->execute(); }
    catch (mysqli_sql_exception $e) { if ($e->getCode()===1062) reply(['error'=>'An account with this email already exists.'],409); throw $e; }
    session_regenerate_id(true); $_SESSION['user_id']=$db->insert_id; reply(['ok'=>true,'user'=>currentUser($db)],201);
  }
  if ($route === 'login' && $method === 'POST') {
    $email=strtolower(trim($input['email']??'')); $password=$input['password']??'';
    $stmt=$db->prepare('SELECT id,password_hash,blocked FROM users WHERE email=?'); $stmt->bind_param('s',$email); $stmt->execute(); $found=$stmt->get_result()->fetch_assoc();
    if (!$found || !password_verify($password,$found['password_hash'])) reply(['error'=>'Incorrect email or password.'],401);
    if ($found['blocked']) reply(['error'=>'This account has been blocked. Please contact support.'],403);
    session_regenerate_id(true); $_SESSION['user_id']=(int)$found['id']; reply(['ok'=>true,'user'=>currentUser($db)]);
  }
  if ($route === 'me' && $method === 'GET') { $u=currentUser($db); reply(['user'=>$u]); }
  if ($route === 'logout' && $method === 'POST') { $_SESSION=[]; session_destroy(); reply(['ok'=>true]); }

  if ($route === 'contact' && $method === 'POST') {
    $name=trim($input['name']??''); $email=strtolower(trim($input['email']??'')); $topic=trim($input['topic']??'Other'); $order=trim($input['order']??''); $message=trim($input['message']??'');
    if (mb_strlen($name)<2 || !filter_var($email,FILTER_VALIDATE_EMAIL) || mb_strlen($message)<10 || mb_strlen($message)>1000) reply(['error'=>'Please check your name, email and message.'],422);
    $ref='M-'.random_int(100000,999999); $stmt=$db->prepare('INSERT INTO contact_messages(reference_code,name,email,topic,order_reference,message) VALUES(?,?,?,?,?,?)'); $stmt->bind_param('ssssss',$ref,$name,$email,$topic,$order,$message); $stmt->execute(); reply(['id'=>$ref,'name'=>$name,'email'=>$email,'topic'=>$topic,'order'=>$order,'message'=>$message,'date'=>date('Y-m-d'),'read'=>false],201);
  }
  if ($route === 'orders' && $method === 'GET') {
    $u=currentUser($db); if (!$u) reply(['error'=>'Please log in.'],401);
    $stmt=$db->prepare('SELECT id,order_number,date(created_at) date,created_at,status,customer_email email,customer_name name,shipping_address ship,subtotal,shipping,total FROM orders WHERE user_id=? ORDER BY id DESC'); $stmt->bind_param('i',$u['id']); $stmt->execute(); $res=$stmt->get_result(); $orders=[];
    while($o=$res->fetch_assoc()) { $oid=(int)$o['id']; $items=$db->query('SELECT product_id id,product_name name,emoji,quantity qty,unit_price price FROM order_items WHERE order_id='.$oid); $o['id']=$o['order_number']; unset($o['order_number']); $o['total']=(float)$o['total']; $o['items']=[]; while($it=$items->fetch_assoc()) { $it['id']=(string)$it['id']; $it['qty']=(int)$it['qty']; $it['price']=(float)$it['price']; $o['items'][]=$it; } $orders[]=$o; }
    reply(['orders'=>$orders]);
  }
  if ($route === 'orders' && $method === 'POST') {
    $u=currentUser($db); if (!$u) reply(['error'=>'Please log in.'],401);
    $items=$input['items']??[]; $address=trim($input['address']??''); $city=trim($input['city']??''); if (!$items || !$address || !$city) reply(['error'=>'Delivery address, city and items are required.'],422);
    $db->begin_transaction();
    try {
      $subtotal=0; $validated=[];
      foreach($items as $it) { $pid=(int)($it['id']??0); $qty=(int)($it['qty']??0); if($pid<1||$qty<1) throw new Exception('Invalid item.'); $st=$db->prepare('SELECT id,name,emoji,price,stock FROM products WHERE id=? FOR UPDATE'); $st->bind_param('i',$pid); $st->execute(); $p=$st->get_result()->fetch_assoc(); if(!$p || $p['stock']<$qty) throw new Exception('A product is unavailable or has insufficient stock.'); $p['qty']=$qty; $subtotal+=(float)$p['price']*$qty; $validated[]=$p; }
      $shipping=$subtotal>100?0:6.99; $total=$subtotal+$shipping; $number='#'.(string)random_int(100000,999999); $fullAddress=$address.', '.$city;
      $st=$db->prepare("INSERT INTO orders(order_number,user_id,customer_name,customer_email,shipping_address,status,subtotal,shipping,total) VALUES(?,?,?,?,?,'Processing',?,?,?)"); $st->bind_param('sisssddd',$number,$u['id'],$u['name'],$u['email'],$fullAddress,$subtotal,$shipping,$total); $st->execute(); $orderId=$db->insert_id;
      foreach($validated as $p) { $pid=(int)$p['id']; $qty=(int)$p['qty']; $price=(float)$p['price']; $st=$db->prepare('INSERT INTO order_items(order_id,product_id,product_name,emoji,quantity,unit_price) VALUES(?,?,?,?,?,?)'); $st->bind_param('iissid',$orderId,$pid,$p['name'],$p['emoji'],$qty,$price); $st->execute(); $st=$db->prepare('UPDATE products SET stock=stock-? WHERE id=?'); $st->bind_param('ii',$qty,$pid); $st->execute(); }
      $db->commit(); reply(['ok'=>true,'id'=>$number,'total'=>$total]);
    } catch(Throwable $e) { $db->rollback(); reply(['error'=>$e instanceof Exception?$e->getMessage():'Could not place order.'],422); }
  }
  reply(['error'=>'Unknown API route.'],404);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['error'=>'Server error. Check that XAMPP MySQL is running and the shopwise_ai database has been imported.']);
}
