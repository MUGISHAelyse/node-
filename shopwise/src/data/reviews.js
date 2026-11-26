// Sample customer reviews (acts as a fake database).
// Each row is [author, rating 1-5, title, text, date]. The key is the product id.
const raw = {
  '1': [
    ['Amara K.', 5, 'Noise cancelling that works', 'Blocks out the bus and the office completely. The battery lasted my whole week of commuting.', '2026-08-14'],
    ['Daniel M.', 5, 'Comfortable for long calls', 'I wear them for hours on video calls and my ears never get sore. The sound is balanced.', '2026-07-29'],
    ['Priya S.', 4, 'Good, but the case is bulky', 'Sound and battery are excellent. The carry case is a bit large for a small bag.', '2026-06-18'],
  ],
  '2': [
    ['Tendai R.', 5, 'Sleep tracking is spot on', 'The sleep report matches how I feel in the morning, and the heart rate readings look right.', '2026-09-02'],
    ['Lena B.', 4, 'Bright screen, simple app', 'Easy to read in sunlight and the app is clear. Notifications sometimes arrive a few seconds late.', '2026-08-11'],
    ['Omar F.', 4, 'Strap could be softer', 'Great watch overall. I swapped the strap for a softer one and now it is perfect.', '2026-07-05'],
  ],
  '3': [
    ['Chloe W.', 5, 'Fast and light', 'Starts in seconds and fits in my bag without me noticing the weight. Battery gets me through a full day.', '2026-09-10'],
    ['Joseph N.', 5, 'Perfect for studying', 'Runs my notes, browser tabs and video lectures together with no slowdown.', '2026-08-03'],
    ['Maria G.', 4, 'Fan gets noisy under load', 'Very quick for everyday work. The fan is audible when editing video.', '2026-06-27'],
  ],
  '4': [
    ['Ibrahim T.', 5, 'Sharp photos', 'Details look crisp even in low light. The kit lens is a good starting point.', '2026-09-15'],
    ['Sofia L.', 4, 'Menus take time to learn', 'Photo quality is great. It took me a weekend to find the settings I use most.', '2026-08-21'],
    ['Kevin P.', 4, 'Wi-Fi sharing is handy', 'Sending photos to my phone is quick. I wish the battery lasted a little longer.', '2026-07-12'],
    ['Nadia H.', 5, 'Video looks great', 'The 4K clips are smooth and the colours are natural straight out of the camera.', '2026-06-03'],
  ],
  '5': [
    ['Grace O.', 4, 'Cushioned and light', 'Comfortable from the first run. They run slightly small, so consider half a size up.', '2026-09-07'],
    ['Peter V.', 5, 'Best sneakers I have owned', 'Great grip and breathable. I walk about 10 km a day in them.', '2026-08-16'],
    ['Aisha D.', 4, 'Good value', 'Looks good and feels good. The white colour gets dirty quickly.', '2026-07-20'],
  ],
  '6': [
    ['Samuel A.', 5, 'Fits my laptop perfectly', 'The padded sleeve holds a 15-inch laptop and there is still room for lunch.', '2026-09-01'],
    ['Hannah J.', 4, 'Kept my things dry', 'Got caught in heavy rain and everything inside stayed dry. The zips feel solid.', '2026-08-09'],
    ['Eric M.', 5, 'Lots of pockets', 'Every small item has a place. I use it for work and for weekend trips.', '2026-07-14'],
    ['Zara K.', 4, 'Comfortable straps', 'Carries well even when full. I would like one more side pocket for a bottle.', '2026-06-22'],
  ],
  '7': [
    ['Brian C.', 4, 'Light on the face', 'Barely notice them while driving and the lenses cut the glare well.', '2026-08-30'],
    ['Esther N.', 4, 'Stylish for the price', 'Good looking frame. Arrived with a soft pouch.', '2026-07-25'],
    ['Victor S.', 5, 'Great for the beach', 'Strong sun protection and they stay on while running.', '2026-07-01'],
    ['Linda F.', 3, 'Scratches easily', 'Nice look, but the lenses picked up scratches after a few weeks.', '2026-06-10'],
  ],
  '8': [
    ['Michael B.', 4, 'Comfortable fit', 'Soft denim that did not need breaking in. True to size.', '2026-09-05'],
    ['Faith R.', 4, 'Good everyday jeans', 'Look good with sneakers or boots and hold their colour after washing.', '2026-08-02'],
    ['David L.', 5, 'Best fit so far', 'Straight cut, plenty of room, and the stitching is strong.', '2026-06-29'],
  ],
  '9': [
    ['Naledi M.', 5, 'Beautiful and breathable', 'The fabric is light and the print is even prettier in person. I got compliments all day.', '2026-09-12'],
    ['Julia P.', 5, 'Perfect for summer', 'Comfortable in the heat and it has pockets. I ordered a second one.', '2026-08-18'],
    ['Ruth T.', 4, 'Runs a little long', 'Lovely dress. I am short, so I had to hem it.', '2026-07-08'],
  ],
  '10': [
    ['George H.', 5, 'Warm without being heavy', 'Kept me warm in freezing wind and the hood fits snugly.', '2026-09-09'],
    ['Alice W.', 5, 'Water resistant for real', 'Walked home in the rain and stayed dry. Looks smart too.', '2026-08-25'],
    ['Thomas K.', 5, 'Worth every dollar', 'Great quality for the price, with deep pockets and a strong zip.', '2026-07-30'],
    ['Mia R.', 4, 'Order a size up', 'Really warm. It is cut slim, so size up if you wear layers.', '2026-06-15'],
  ],
  '11': [
    ['Patricia E.', 5, 'Three great reads', 'All three novels kept me turning pages. Good paper quality too.', '2026-09-03'],
    ['Henry Z.', 5, 'Perfect gift', 'Bought as a birthday present and my sister loved the selection.', '2026-08-07'],
    ['Olivia D.', 4, 'Good variety', 'A nice mix of genres. One book was not my taste, but that is my own preference.', '2026-07-17'],
  ],
  '12': [
    ['Mark U.', 4, 'Holds its shape', 'Plays well on grass and the stitching is holding up after weeks of matches.', '2026-09-06'],
    ['Janet S.', 5, 'Great for training', 'Good size and bounce. My team uses it every week.', '2026-08-13'],
    ['Sipho L.', 4, 'Solid ball', 'Feels like a proper match ball. Needs a bit of air every few days.', '2026-07-09'],
    ['Carla V.', 4, 'Good value', 'Does everything I need for the price.', '2026-06-20'],
  ],
  '13': [
    ['Felix D.', 5, 'Warm tone', 'The spruce top gives a rich, warm sound. Great for learning on.', '2026-09-11'],
    ['Imani B.', 4, 'Easy to play', 'Low action, so chords are comfortable. It needed a quick tune after delivery.', '2026-08-04'],
    ['Robert Q.', 5, 'Beautiful guitar', 'Looks and sounds far more expensive than it is.', '2026-07-23'],
    ['Yusuf A.', 4, 'Good for beginners', 'I started with this and I am already playing songs. A case would be a nice extra.', '2026-06-12'],
  ],
}

// Turns the table above into a flat list of review objects. It adds an id, the product id and verified: true.
export const seedReviews = Object.entries(raw).flatMap(([productId, rows]) =>
  rows.map(([author, rating, title, text, date], i) => ({
    id: `r${productId}-${i + 1}`,
    productId,
    author,
    rating,
    title,
    text,
    date,
    verified: true,
  }))
)
