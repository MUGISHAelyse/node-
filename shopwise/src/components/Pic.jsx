// Pic.jsx: the picture of a product. It shows the uploaded photo when there is one, otherwise the emoji.
// Put it inside a container such as <div className="pic">.

export default function Pic({ product }) {
  // `image` is a photo chosen by the admin (saved as text in the browser). Without one, the emoji is the picture.
  if (product.image) return <img className="pic-img" src={product.image} alt="" loading="lazy" />
  return product.emoji || '📦'
}
