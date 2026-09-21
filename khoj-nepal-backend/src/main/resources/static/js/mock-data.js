/* Khoj Nepal - sample feed posts (varied authors/statuses; live claims use TiDB posts) */

const CATEGORIES = [
  {
    id: 'devices', en: 'Devices', ne: 'उपकरण',
    subcategories: [
      { id: 'mobile', en: 'Mobile', ne: 'मोबाइल' },
      { id: 'laptop', en: 'Laptop', ne: 'ल्यापटप' },
      { id: 'tablet', en: 'Tablet', ne: 'ट्याब्लेट' },
      { id: 'earbuds', en: 'Earbuds / Headphones', ne: 'इयरबड / हेडफोन' },
      { id: 'other', en: 'Other', ne: 'अन्य' }
    ]
  },
  {
    id: 'documents', en: 'Documents', ne: 'कागजात',
    subcategories: [
      { id: 'citizenship', en: 'Citizenship', ne: 'नागरिकता' },
      { id: 'license', en: 'License', ne: 'लाइसेन्स' },
      { id: 'nid', en: 'National ID', ne: 'राष्ट्रिय परिचय पत्र' },
      { id: 'certificate', en: 'Certificate', ne: 'प्रमाणपत्र' },
      { id: 'other', en: 'Other', ne: 'अन्य' }
    ]
  },
  {
    id: 'animals', en: 'Animals / Pets', ne: 'जनावर / पाल्तु',
    subcategories: [
      { id: 'dog', en: 'Dog', ne: 'कुकुर' },
      { id: 'cat', en: 'Cat', ne: 'बिरालो' },
      { id: 'other_pet', en: 'Other Pet', ne: 'अन्य पाल्तु' },
      { id: 'other', en: 'Other', ne: 'अन्य' }
    ]
  },
  {
    id: 'accessories', en: 'Personal Accessories', ne: 'व्यक्तिगत सामान',
    subcategories: [
      { id: 'wallet', en: 'Wallet', ne: 'पर्स' },
      { id: 'bag', en: 'Bag / Backpack', ne: 'झोला' },
      { id: 'jewelry', en: 'Jewelry', ne: 'गहना' },
      { id: 'watch', en: 'Watch', ne: 'घडी' },
      { id: 'other', en: 'Other', ne: 'अन्य' }
    ]
  },
  {
    id: 'vehicle', en: 'Vehicle & Transport', ne: 'सवारी साधन',
    subcategories: [
      { id: 'helmet', en: 'Helmet', ne: 'हेल्मेट' },
      { id: 'number_plate', en: 'Number Plate', ne: 'नम्बर प्लेट' },
      { id: 'vehicle_docs', en: 'Vehicle Documents', ne: 'सवारी कागजात' },
      { id: 'other', en: 'Other', ne: 'अन्य' }
    ]
  },
  {
    id: 'keys', en: 'Keys & Security', ne: 'साँचो र सुरक्षा',
    subcategories: [
      { id: 'house_keys', en: 'House Keys', ne: 'घरको साँचो' },
      { id: 'vehicle_keys', en: 'Vehicle Keys', ne: 'गाडीको साँचो' },
      { id: 'other', en: 'Other', ne: 'अन्य' }
    ]
  },
  {
    id: 'other', en: 'Others', ne: 'अन्य',
    subcategories: [
      { id: 'misc', en: 'Miscellaneous', ne: 'विविध' },
      { id: 'other', en: 'Other', ne: 'अन्य' }
    ]
  }
];

const DEMO_POST_AUTHORS = [
  { id: 101, name: 'Suman Shrestha', nameNe: 'सुमन श्रेष्ठ', avatar: 'SS' },
  { id: 102, name: 'Anisha Gurung', nameNe: 'अनिशा गुरुङ', avatar: 'AG' },
  { id: 103, name: 'Ramesh Maharjan', nameNe: 'रमेश महर्जन', avatar: 'RM' },
  { id: 104, name: 'Pratik Shakya', nameNe: 'प्रतिक शाक्य', avatar: 'PS' },
  { id: 105, name: 'Nisha Thapa', nameNe: 'निशा थापा', avatar: 'NT' },
  { id: 106, name: 'Bikash Adhikari', nameNe: 'बिकास अधिकारी', avatar: 'BA' },
  { id: 107, name: 'Sita Rai', nameNe: 'सीता राई', avatar: 'SR' },
  { id: 108, name: 'Hari Poudel', nameNe: 'हरि पौडेल', avatar: 'HP' },
  { id: 109, name: 'Manisha KC', nameNe: 'मनिषा केसी', avatar: 'MK' },
  { id: 110, name: 'Dipesh Tamang', nameNe: 'दिपेश तामाङ', avatar: 'DT' },
  { id: 111, name: 'Kiran Basnet', nameNe: 'किरण बस्नेत', avatar: 'KB' },
  { id: 112, name: 'Pooja Sharma', nameNe: 'पूजा शर्मा', avatar: 'PSh' },
  { id: 113, name: 'Aashish Karki', nameNe: 'आशिष कार्की', avatar: 'AK' },
  { id: 114, name: 'Sunita Lama', nameNe: 'सुनिता लामा', avatar: 'SL' },
  { id: 115, name: 'Roshan Bhandari', nameNe: 'रोशन भण्डारी', avatar: 'RB' },
  { id: 116, name: 'Maya Gurung', nameNe: 'माया गुरुङ', avatar: 'MG' },
  { id: 117, name: 'Nabin Shrestha', nameNe: 'नबिन श्रेष्ठ', avatar: 'NS' },
  { id: 118, name: 'Kabita Magar', nameNe: 'कबिता मगर', avatar: 'KM' },
  { id: 119, name: 'Sanjay Thapa', nameNe: 'सञ्जय थापा', avatar: 'ST' },
  { id: 120, name: 'Rita Joshi', nameNe: 'रिता जोशी', avatar: 'RJ' }
];

const ADMIN_OFFICE = {
  name: 'Khoj Nepal Admin Office',
  nameNe: 'खोज नेपाल प्रशासन कार्यालय',
  location: 'New Baneshwor, Kathmandu',
  locationNe: 'नयाँ बानेश्वर, काठमाडौं',
  hours: 'Sun–Fri: 10:00 AM – 5:00 PM',
  hoursNe: 'आइत–शुक्र: बिहान १० – बेलुका ५',
  phone: '+977-1-5550123',
  email: 'office@khojnepal.com',
  instructions: 'Valuable found items should be submitted to the Admin Office. Do not hand over items directly to strangers.',
  instructionsNe: 'महत्त्वपूर्ण भेटिएका सामान प्रशासन कार्यालयमा बुझाउनुहोस्। अपरिचितलाई सिधै नदिनुहोस्।'
};

const JOURNEY_STEPS = [
  { id: 'posted', en: 'Posted', ne: 'पोस्ट भयो' },
  { id: 'info_received', en: 'Information / Claim Received', ne: 'जानकारी / दावी प्राप्त' },
  { id: 'admin_verify', en: 'Admin Verification', ne: 'प्रशासक प्रमाणीकरण' },
  { id: 'item_received', en: 'Item Received by Admin', ne: 'प्रशासकले सामान प्राप्त' },
  { id: 'owner_verified', en: 'Owner Verified', ne: 'मालिक प्रमाणित' },
  { id: 'delivered', en: 'Delivered to Owner', ne: 'मालिकलाई वितरण' }
];

const HANDOVER_STEPS = [
  { id: 'reported', en: 'Finder Reported Item', ne: 'भेट्नेले रिपोर्ट गरे' },
  { id: 'contacted', en: 'Admin Contacted', ne: 'प्रशासक सम्पर्क' },
  { id: 'at_office', en: 'Item Received at Office', ne: 'कार्यालयमा प्राप्त' },
  { id: 'verification', en: 'Verification', ne: 'प्रमाणीकरण' },
  { id: 'ready', en: 'Ready for Owner', ne: 'मालिकका लागि तयार' },
  { id: 'delivered', en: 'Delivered', ne: 'वितरण भयो' }
];

/* Journey progress index 0-5 based on status */
function journeyIndexForStatus(status) {
  const map = {
    active: 0,
    claim_pending: 1,
    under_verification: 2,
    received_by_admin: 3,
    owner_found: 4,
    delivered: 5,
    archived: 5,
    suspicious: 2
  };
  return map[status] ?? 0;
}

const MOCK_POSTS = [
  {
    id: 1, type: 'lost', status: 'active',
    userId: 101, userName: 'Suman Shrestha', userAvatar: 'SS',
    location: 'Koteshwor, Kathmandu', locationNe: 'कोटेश्वर, काठमाडौं',
    time: '20 minutes ago', timeNe: '२० मिनेट अघि',
    title: 'Black Samsung Galaxy Phone', titleNe: 'कालो स्यामसुङ ग्यालेक्सी फोन',
    description: 'Lost black Samsung Galaxy A54 near Koteshwor Bus Park. Blue cover, small crack on corner.',
    descriptionNe: 'कोटेश्वर बस पार्क नजिकै कालो स्यामसुङ A54 हराएको।',
    category: 'devices', subcategory: 'mobile', date: '2026-09-14', image: null
  },
  {
    id: 2, type: 'found', status: 'active',
    userId: 102, userName: 'Anisha Gurung', userAvatar: 'AG',
    location: 'Patan Durbar Square, Lalitpur', locationNe: 'पाटन दरबार स्क्वायर, ललितपुर',
    time: '1 hour ago', timeNe: '१ घण्टा अघि',
    title: 'Brown Leather Wallet', titleNe: 'खैरो छालाको पर्स',
    description: 'Found a brown leather wallet near Patan Durbar Square. Cards inside, no cash.',
    descriptionNe: 'पाटन दरबार स्क्वायर नजिकै खैरो छालाको पर्स भेटियो।',
    category: 'accessories', subcategory: 'wallet', date: '2026-09-14', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=300&fit=crop'
  },
  {
    id: 3, type: 'lost', status: 'under_verification',
    userId: 103, userName: 'Ramesh Maharjan', userAvatar: 'RM',
    location: 'Baneshwor Chowk, Kathmandu', locationNe: 'बानेश्वर चोक, काठमाडौं',
    time: 'Yesterday', timeNe: 'हिजो',
    title: 'Citizenship Card', titleNe: 'नागरिकता',
    description: 'Lost Nepali citizenship card near Baneshwor Chowk.',
    descriptionNe: 'बानेश्वर चोक नजिकै नागरिकता हराएको।',
    category: 'documents', subcategory: 'citizenship', date: '2026-09-13', image: null
  },
  {
    id: 4, type: 'found', status: 'received_by_admin',
    userId: 104, userName: 'Pratik Shakya', userAvatar: 'PS',
    location: 'Ratnapark Bus Stop, Kathmandu', locationNe: 'रत्नपार्क बस स्टप, काठमाडौं',
    time: '2 days ago', timeNe: '२ दिन अघि',
    title: 'Black Backpack with Books', titleNe: 'किताब भएको कालो झोला',
    description: 'Found black backpack at Ratnapark bus stop. Handed to Admin Office.',
    descriptionNe: 'रत्नपार्कमा कालो झोला भेटियो।',
    category: 'accessories', subcategory: 'bag', date: '2026-09-12', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
    handoverStep: 'at_office'
  },
  {
    id: 5, type: 'lost', status: 'active',
    userId: 105, userName: 'Nisha Thapa', userAvatar: 'NT',
    location: 'Thamel, Kathmandu', locationNe: 'ठमेल, काठमाडौं',
    time: '3 days ago', timeNe: '३ दिन अघि',
    title: 'Golden Retriever — Bruno', titleNe: 'गोल्डेन रिट्रिभर — ब्रुनो',
    description: 'Friendly golden retriever Bruno missing near Thamel. Red collar.',
    descriptionNe: 'ठमेल नजिकै ब्रुनो हराएको।',
    category: 'animals', subcategory: 'dog', date: '2026-09-12', image: null
  },
  {
    id: 6, type: 'found', status: 'claim_pending',
    userId: 106, userName: 'Bikash Adhikari', userAvatar: 'BA',
    location: 'Thamel, Kathmandu', locationNe: 'ठमेल, काठमाडौं',
    time: '2 days ago', timeNe: '२ दिन अघि',
    title: 'Found Dog — Golden Retriever', titleNe: 'भेटिएको कुकुर — गोल्डेन रिट्रिभर',
    description: 'Golden retriever found near Thamel. A claim is already under review.',
    descriptionNe: 'ठमेल नजिकै कुकुर भेटियो। दावी समीक्षामा छ।',
    category: 'animals', subcategory: 'dog', date: '2026-09-11', image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop'
  },
  {
    id: 7, type: 'found', status: 'claim_pending',
    userId: 107, userName: 'Sita Rai', userAvatar: 'SR',
    location: 'New Road, Kathmandu', locationNe: 'न्यू रोड, काठमाडौं',
    time: '1 day ago', timeNe: '१ दिन अघि',
    title: 'Silver Wrist Watch', titleNe: 'चाँदीको घडी',
    description: 'Found silver wrist watch at New Road. Another claim is in progress.',
    descriptionNe: 'न्यू रोडमा घडी भेटियो। दावी प्रक्रियामा छ।',
    category: 'accessories', subcategory: 'watch', date: '2026-09-13', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=300&fit=crop'
  },
  {
    id: 8, type: 'found', status: 'delivered',
    userId: 108, userName: 'Hari Poudel', userAvatar: 'HP',
    location: 'Bhaktapur Durbar Square', locationNe: 'भक्तपुर दरबार स्क्वायर',
    time: '1 week ago', timeNe: '१ हप्ता अघि',
    title: 'House Keys with Red Keychain', titleNe: 'रातो किचेन भएको घरको साँचो',
    description: 'Returned to rightful owner after admin verification.',
    descriptionNe: 'मालिकलाई फिर्ता गरियो।',
    category: 'keys', subcategory: 'house_keys', date: '2026-08-25', image: 'https://images.unsplash.com/photo-1582139329536-da3e388f6e38?w=400&h=300&fit=crop',
    handoverStep: 'delivered',
    deliveredDate: '2026-09-01', retentionDaysLeft: 10,
    deliveredMessage: 'This item has been successfully returned to its rightful owner.',
    deliveredMessageNe: 'यो सामान सफलतापूर्वक मालिकलाई फिर्ता गरिएको छ।'
  },
  {
    id: 9, type: 'lost', status: 'active',
    userId: 109, userName: 'Manisha KC', userAvatar: 'MK',
    location: 'Lakeside, Pokhara', locationNe: 'लेकसाइड, पोखरा',
    time: '4 days ago', timeNe: '४ दिन अघि',
    title: 'Dell Inspiron Laptop', titleNe: 'डेल इन्स्पिरन ल्यापटप',
    description: 'Lost silver Dell Inspiron 15 in a cafe near Lakeside.',
    descriptionNe: 'लेकसाइड नजिकै ल्यापटप हराएको।',
    category: 'devices', subcategory: 'laptop', date: '2026-09-10', image: null
  },
  {
    id: 10, type: 'found', status: 'claim_pending',
    userId: 110, userName: 'Dipesh Tamang', userAvatar: 'DT',
    location: 'Koteshwor Junction, Kathmandu', locationNe: 'कोटेश्वर जंक्सन, काठमाडौं',
    time: '6 hours ago', timeNe: '६ घण्टा अघि',
    title: 'National ID Card', titleNe: 'राष्ट्रिय परिचय पत्र',
    description: 'Found NID near Koteshwor junction. Claim under review.',
    descriptionNe: 'कोटेश्वरमा NID भेटियो। दावी समीक्षामा।',
    category: 'documents', subcategory: 'nid', date: '2026-09-09', image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop'
  },
  {
    id: 11, type: 'lost', status: 'active',
    userId: 111, userName: 'Kiran Basnet', userAvatar: 'KB',
    location: 'New Road, Kathmandu', locationNe: 'न्यू रोड, काठमाडौं',
    time: '5 hours ago', timeNe: '५ घण्टा अघि',
    title: 'Gold Chain Necklace', titleNe: 'सुनको चेन',
    description: 'Lost thin gold chain with Om pendant on New Road.',
    descriptionNe: 'न्यू रोडमा सुनको चेन हराएको।',
    category: 'accessories', subcategory: 'jewelry', date: '2026-09-14', image: null
  },
  {
    id: 12, type: 'found', status: 'active',
    userId: 112, userName: 'Pooja Sharma', userAvatar: 'PSh',
    location: 'Tribhuvan University, Kirtipur', locationNe: 'त्रिभुवन विश्वविद्यालय, कीर्तिपुर',
    time: 'Yesterday', timeNe: 'हिजो',
    title: 'Blue Tablet Case with iPad', titleNe: 'आइप्याड सहित नीलो ट्याब्लेट केस',
    description: 'Found blue tablet case with iPad near TU library.',
    descriptionNe: 'त्रिवि पुस्तकालय नजिकै आइप्याड भेटियो।',
    category: 'devices', subcategory: 'tablet', date: '2026-09-13', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop'
  },
  {
    id: 13, type: 'lost', status: 'claim_pending',
    userId: 113, userName: 'Aashish Karki', userAvatar: 'AK',
    location: 'Kalanki, Kathmandu', locationNe: 'कलंकी, काठमाडौं',
    time: '2 days ago', timeNe: '२ दिन अघि',
    title: 'Driving License', titleNe: 'सवारी चालक अनुमतिपत्र',
    description: 'Lost driving license near Kalanki bus park.',
    descriptionNe: 'कलंकीमा लाइसेन्स हराएको।',
    category: 'documents', subcategory: 'license', date: '2026-09-11', image: null
  },
  {
    id: 14, type: 'found', status: 'under_verification',
    userId: 114, userName: 'Sunita Lama', userAvatar: 'SL',
    location: 'Basantapur, Kathmandu', locationNe: 'बसन्तपुर, काठमाडौं',
    time: 'August 28', timeNe: 'अगस्ट २८',
    title: 'Motorcycle Helmet — Red', titleNe: 'रातो मोटरसाइकल हेल्मेट',
    description: 'Found red full-face helmet near Basantapur.',
    descriptionNe: 'बसन्तपुर नजिकै हेल्मेट भेटियो।',
    category: 'vehicle', subcategory: 'helmet', date: '2026-08-28', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    handoverStep: 'contacted'
  },
  {
    id: 15, type: 'lost', status: 'active',
    userId: 115, userName: 'Roshan Bhandari', userAvatar: 'RB',
    location: 'Pulchowk, Lalitpur', locationNe: 'पुल्चोक, ललितपुर',
    time: 'August 25', timeNe: 'अगस्ट २५',
    title: 'Set of Office Keys', titleNe: 'अफिसका साँचोहरू',
    description: 'Lost three office keys with green Floor 2 tag near Pulchowk.',
    descriptionNe: 'पुल्चोक नजिकै साँचो हराएको।',
    category: 'keys', subcategory: 'house_keys', date: '2026-08-25', image: null
  },
  {
    id: 16, type: 'found', status: 'owner_found',
    userId: 116, userName: 'Maya Gurung', userAvatar: 'MG',
    location: 'Chabahil, Kathmandu', locationNe: 'चाबहिल, काठमाडौं',
    time: '5 days ago', timeNe: '५ दिन अघि',
    title: 'Wrist Watch — Silver', titleNe: 'चाँदी रङको हातघडी',
    description: 'Owner verified. Listed for transparency.',
    descriptionNe: 'मालिक प्रमाणित।',
    category: 'accessories', subcategory: 'watch', date: '2026-08-29', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=300&fit=crop',
    deliveredDate: '2026-09-01', retentionDaysLeft: 10,
    deliveredMessage: 'This item has been successfully returned to its rightful owner.',
    deliveredMessageNe: 'यो सामान सफलतापूर्वक मालिकलाई फिर्ता गरिएको छ।'
  },
  {
    id: 17, type: 'lost', status: 'active',
    userId: 117, userName: 'Nabin Shrestha', userAvatar: 'NS',
    location: 'Biratnagar Bus Park', locationNe: 'विराटनगर बस पार्क',
    time: 'August 28', timeNe: 'अगस्ट २८',
    title: 'Grey Cat — Mini', titleNe: 'खैरो बिरालो — मिनी',
    description: 'Indoor grey cat Mini escaped near Biratnagar bus park.',
    descriptionNe: 'विराटनगरमा मिनी हराएको।',
    category: 'animals', subcategory: 'cat', date: '2026-08-28', image: null
  },
  {
    id: 18, type: 'found', status: 'active',
    userId: 118, userName: 'Kabita Magar', userAvatar: 'KM',
    location: 'Gongabu Bus Park, Kathmandu', locationNe: 'गोंगबु बस पार्क, काठमाडौं',
    time: '3 hours ago', timeNe: '३ घण्टा अघि',
    title: 'Wireless Earbuds Case', titleNe: 'वायरलेस इयरबड केस',
    description: 'Found white earbuds case at Gongabu bus park.',
    descriptionNe: 'गोंगबुमा इयरबड केस भेटियो।',
    category: 'devices', subcategory: 'earbuds', date: '2026-09-14', image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&h=300&fit=crop'
  },
  {
    id: 19, type: 'lost', status: 'suspicious',
    userId: 119, userName: 'Sanjay Thapa', userAvatar: 'ST',
    location: 'Putalisadak, Kathmandu', locationNe: 'पुतलीसडक, काठमाडौं',
    time: '6 days ago', timeNe: '६ दिन अघि',
    title: 'Vehicle Blue Book', titleNe: 'सवारी ब्लु बुक',
    description: 'Lost vehicle blue book. Conflicting claims under investigation.',
    descriptionNe: 'ब्लु बुक हराएको। अनुसन्धानमा।',
    category: 'vehicle', subcategory: 'vehicle_docs', date: '2026-08-27', image: null
  },
  {
    id: 20, type: 'found', status: 'received_by_admin',
    userId: 120, userName: 'Rita Joshi', userAvatar: 'RJ',
    location: 'Maharajgunj, Kathmandu', locationNe: 'महाराजगंज, काठमाडौं',
    time: '4 days ago', timeNe: '४ दिन अघि',
    title: 'School Certificate Folder', titleNe: 'विद्यालय प्रमाणपत्र फोल्डर',
    description: 'Found certificate folder near Maharajgunj. At Admin Office.',
    descriptionNe: 'महाराजगंजमा फोल्डर भेटियो।',
    category: 'documents', subcategory: 'certificate', date: '2026-08-30', image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop',
    handoverStep: 'at_office'
  },
  {
    id: 21, type: 'lost', status: 'active',
    userId: 101, userName: 'Suman Shrestha', userAvatar: 'SS',
    location: 'Lagankhel, Lalitpur', locationNe: 'लगनखेल, ललितपुर',
    time: '2 days ago', timeNe: '२ दिन अघि',
    title: 'Redmi Note Power Bank', titleNe: 'रेडमी पावर बैंक',
    description: 'Lost black 20000mAh power bank in Lagankhel microbus.',
    descriptionNe: 'लगनखेलमा पावर बैंक हराएको।',
    category: 'devices', subcategory: 'other', date: '2026-09-13', image: null
  },
  {
    id: 22, type: 'found', status: 'active',
    userId: 102, userName: 'Anisha Gurung', userAvatar: 'AG',
    location: 'Balkumari, Lalitpur', locationNe: 'बाकुमारी, ललितपुर',
    time: '3 days ago', timeNe: '३ दिन अघि',
    title: 'Kids School Bag — Blue', titleNe: 'नीलो विद्यालय झोला',
    description: 'Found blue school bag near Balkumari bridge.',
    descriptionNe: 'बाकुमारीमा विद्यालय झोला भेटियो।',
    category: 'accessories', subcategory: 'bag', date: '2026-09-12', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop'
  },
  {
    id: 23, type: 'lost', status: 'active',
    userId: 103, userName: 'Ramesh Maharjan', userAvatar: 'RM',
    location: 'Satdobato, Lalitpur', locationNe: 'सातदोबाटो, ललितपुर',
    time: '4 days ago', timeNe: '४ दिन अघि',
    title: 'Motorcycle Key with Remote', titleNe: 'रिमोटसहित मोटरसाइकल साँचो',
    description: 'Lost Yamaha key with remote near Satdobato.',
    descriptionNe: 'सातदोबाटोमा गाडीको साँचो हराएको।',
    category: 'keys', subcategory: 'vehicle_keys', date: '2026-09-11', image: null
  },
  {
    id: 24, type: 'found', status: 'claim_pending',
    userId: 104, userName: 'Pratik Shakya', userAvatar: 'PS',
    location: 'TIA, Kathmandu', locationNe: 'त्रिभुवन विमानस्थल, काठमाडौं',
    time: '8 days ago', timeNe: '८ दिन अघि',
    title: 'Passport Cover — Green', titleNe: 'हरियो राहदानी कभर',
    description: 'Found green passport cover at TIA (passport not inside).',
    descriptionNe: 'विमानस्थलमा राहदानी कभर भेटियो।',
    category: 'documents', subcategory: 'other', date: '2026-09-07', image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop'
  },
  {
    id: 25, type: 'lost', status: 'active',
    userId: 105, userName: 'Nisha Thapa', userAvatar: 'NT',
    location: 'Sundhara, Kathmandu', locationNe: 'सुन्धारा, काठमाडौं',
    time: '2 days ago', timeNe: '२ दिन अघि',
    title: 'Spectacles in Black Case', titleNe: 'कालो केसमा चस्मा',
    description: 'Lost reading glasses near Civil Mall.',
    descriptionNe: 'सिभिल मल नजिकै चस्मा हराएको।',
    category: 'accessories', subcategory: 'other', date: '2026-09-13', image: null
  },
  {
    id: 26, type: 'found', status: 'active',
    userId: 106, userName: 'Bikash Adhikari', userAvatar: 'BA',
    location: 'Balkhu, Kathmandu', locationNe: 'बालखु, काठमाडौं',
    time: '6 days ago', timeNe: '६ दिन अघि',
    title: 'Number Plate BA 1 PA 4521', titleNe: 'नम्बर प्लेट BA 1 PA 4521',
    description: 'Found motorcycle number plate near Balkhu Ring Road.',
    descriptionNe: 'बालखुमा नम्बर प्लेट भेटियो।',
    category: 'vehicle', subcategory: 'number_plate', date: '2026-09-09', image: null
  },
  {
    id: 27, type: 'lost', status: 'active',
    userId: 107, userName: 'Sita Rai', userAvatar: 'SR',
    location: 'Jhamsikhel, Lalitpur', locationNe: 'झम्सिखेल, ललितपुर',
    time: '3 days ago', timeNe: '३ दिन अघि',
    title: 'MacBook Charger 61W', titleNe: 'म्याकबुक चार्जर',
    description: 'Lost USB-C MacBook charger in Himalayan Java, Jhamsikhel.',
    descriptionNe: 'झम्सिखेलमा चार्जर हराएको।',
    category: 'devices', subcategory: 'other', date: '2026-09-12', image: null
  },
  {
    id: 28, type: 'found', status: 'under_verification',
    userId: 108, userName: 'Hari Poudel', userAvatar: 'HP',
    location: 'Asan, Kathmandu', locationNe: 'असन, काठमाडौं',
    time: '5 days ago', timeNe: '५ दिन अघि',
    title: 'Silver Bracelet', titleNe: 'चाँदीको ब्रेसलेट',
    description: 'Found silver bracelet near Asan Tol.',
    descriptionNe: 'असनमा ब्रेसलेट भेटियो।',
    category: 'accessories', subcategory: 'jewelry', date: '2026-09-10', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop',
    handoverStep: 'contacted'
  },
  {
    id: 29, type: 'lost', status: 'active',
    userId: 109, userName: 'Manisha KC', userAvatar: 'MK',
    location: 'Battisputali, Kathmandu', locationNe: 'बत्तीसपुतली, काठमाडौं',
    time: '7 days ago', timeNe: '७ दिन अघि',
    title: 'Parrot — Mitthu', titleNe: 'सुगा — मिठ्ठु',
    description: 'Green parrot Mitthu flew from Battisputali balcony.',
    descriptionNe: 'बत्तीसपुतलीबाट सुगा उडेको।',
    category: 'animals', subcategory: 'other_pet', date: '2026-09-08', image: null
  },
  {
    id: 30, type: 'found', status: 'claim_pending',
    userId: 110, userName: 'Dipesh Tamang', userAvatar: 'DT',
    location: 'Maitighar, Kathmandu', locationNe: 'मैतीघर, काठमाडौं',
    time: '4 days ago', timeNe: '४ दिन अघि',
    title: 'Student ID — St. Xavier', titleNe: 'विद्यार्थी परिचय पत्र',
    description: 'Found St. Xavier student ID near Maitighar. Claim submitted.',
    descriptionNe: 'मैतीघरमा विद्यार्थी ID भेटियो।',
    category: 'documents', subcategory: 'other', date: '2026-09-11', image: null
  },
  {
    id: 31, type: 'lost', status: 'active',
    userId: 111, userName: 'Kiran Basnet', userAvatar: 'KB',
    location: 'Old Baneshwor, Kathmandu', locationNe: 'पुरानो बानेश्वर, काठमाडौं',
    time: '2 days ago', timeNe: '२ दिन अघि',
    title: 'Sony WH-1000XM Headphones', titleNe: 'सोनी हेडफोन',
    description: 'Lost Sony headphones in Safa Tempo to Baneshwor.',
    descriptionNe: 'साफा टेम्पोमा हेडफोन हराएको।',
    category: 'devices', subcategory: 'earbuds', date: '2026-09-13', image: null
  },
  {
    id: 32, type: 'found', status: 'active',
    userId: 112, userName: 'Pooja Sharma', userAvatar: 'PSh',
    location: 'Sundhara, Kathmandu', locationNe: 'सुन्धारा, काठमाडौं',
    time: '1 hour ago', timeNe: '१ घण्टा अघि',
    title: 'Umbrella — Navy Blue', titleNe: 'गाढा नीलो छाता',
    description: 'Found navy umbrella outside Nepal Telecom, Sundhara.',
    descriptionNe: 'सुन्धारामा छाता भेटियो।',
    category: 'other', subcategory: 'misc', date: '2026-09-14', image: null
  },
  {
    id: 33, type: 'lost', status: 'active',
    userId: 113, userName: 'Aashish Karki', userAvatar: 'AK',
    location: 'Pashupatinath, Kathmandu', locationNe: 'पशुपतिनाथ, काठमाडौं',
    time: '9 days ago', timeNe: '९ दिन अघि',
    title: 'Wedding Ring — Gold', titleNe: 'सुनको विवाह औंठी',
    description: 'Lost gold wedding ring near Pashupatinath parking.',
    descriptionNe: 'पशुपतिनाथमा औंठी हराएको।',
    category: 'accessories', subcategory: 'jewelry', date: '2026-09-06', image: null
  },
  {
    id: 34, type: 'found', status: 'received_by_admin',
    userId: 114, userName: 'Sunita Lama', userAvatar: 'SL',
    location: 'Kalimati, Kathmandu', locationNe: 'कालिमाटी, काठमाडौं',
    time: '11 days ago', timeNe: '११ दिन अघि',
    title: 'Vehicle Docs Photocopy Set', titleNe: 'ब्लु बुक फोटोकपी',
    description: 'Found vehicle document photocopies. Kept at Admin Office.',
    descriptionNe: 'सवारी कागजात भेटियो। कार्यालयमा।',
    category: 'vehicle', subcategory: 'vehicle_docs', date: '2026-09-04', image: null,
    handoverStep: 'at_office'
  },
  {
    id: 35, type: 'lost', status: 'claim_pending',
    userId: 115, userName: 'Roshan Bhandari', userAvatar: 'RB',
    location: 'Maharajgunj, Kathmandu', locationNe: 'महाराजगंज, काठमाडौं',
    time: '5 days ago', timeNe: '५ दिन अघि',
    title: 'iPhone 13 — Blue', titleNe: 'आइफोन १३ — नीलो',
    description: 'Lost blue iPhone 13 in Bhatbhateni Maharajgunj.',
    descriptionNe: 'महाराजगंजमा आइफोन हराएको।',
    category: 'devices', subcategory: 'mobile', date: '2026-09-10', image: null
  },
  {
    id: 36, type: 'found', status: 'active',
    userId: 116, userName: 'Maya Gurung', userAvatar: 'MG',
    location: 'Dhulikhel, Kavre', locationNe: 'धुलिखेल, काभ्रे',
    time: '6 days ago', timeNe: '६ दिन अघि',
    title: 'Black Formal Shoe (Left)', titleNe: 'कालो औपचारिक जुत्ता',
    description: 'Found one black formal left shoe near KU bus stop, Dhulikhel.',
    descriptionNe: 'धुलिखेलमा जुत्ता भेटियो।',
    category: 'other', subcategory: 'other', date: '2026-09-09', image: null
  },
  {
    id: 37, type: 'lost', status: 'active',
    userId: 117, userName: 'Nabin Shrestha', userAvatar: 'NS',
    location: 'Kamalpokhari, Kathmandu', locationNe: 'कमलापोखरी, काठमाडौं',
    time: '3 days ago', timeNe: '३ दिन अघि',
    title: 'ATM Card — Nabil Bank', titleNe: 'नबिल बैंक एटिएम कार्ड',
    description: 'Lost Nabil ATM card near Kamalpokhari. Already blocked.',
    descriptionNe: 'कमलापोखरीमा एटिएम कार्ड हराएको।',
    category: 'documents', subcategory: 'other', date: '2026-09-12', image: null
  },
  {
    id: 38, type: 'found', status: 'claim_pending',
    userId: 118, userName: 'Kabita Magar', userAvatar: 'KM',
    location: 'Dhapakhel, Lalitpur', locationNe: 'धापाखेल, ललितपुर',
    time: '7 days ago', timeNe: '७ दिन अघि',
    title: 'Laptop Sleeve — Grey', titleNe: 'खैरो ल्यापटप स्लिभ',
    description: 'Found grey laptop sleeve near IT Park Dhapakhel. Claim in progress.',
    descriptionNe: 'धापाखेलमा ल्यापटप स्लिभ भेटियो।',
    category: 'devices', subcategory: 'laptop', date: '2026-09-08', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop'
  },
  {
    id: 39, type: 'lost', status: 'active',
    userId: 119, userName: 'Sanjay Thapa', userAvatar: 'ST',
    location: 'Sanepa, Lalitpur', locationNe: 'सानेपा, ललितपुर',
    time: '4 days ago', timeNe: '४ दिन अघि',
    title: 'Puppy — Indie Mix', titleNe: 'मिश्रित जातको कुकुरको बच्चा',
    description: 'Small brown puppy missing from Sanepa. Blue rope collar.',
    descriptionNe: 'सानेपाबाट कुकुरको बच्चा हराएको।',
    category: 'animals', subcategory: 'dog', date: '2026-09-11', image: null
  },
  {
    id: 40, type: 'found', status: 'delivered',
    userId: 120, userName: 'Rita Joshi', userAvatar: 'RJ',
    location: 'New Baneshwor, Kathmandu', locationNe: 'नयाँ बानेश्वर, काठमाडौं',
    time: '2 weeks ago', timeNe: '२ हप्ता अघि',
    title: 'USB Pendrive 64GB', titleNe: '६४ जीबी पेन्ड्राइभ',
    description: 'Pendrive returned after office verification.',
    descriptionNe: 'पेन्ड्राइभ फिर्ता भयो।',
    category: 'devices', subcategory: 'other', date: '2026-08-20', image: null,
    handoverStep: 'delivered',
    deliveredDate: '2026-09-01', retentionDaysLeft: 10,
    deliveredMessage: 'This item has been successfully returned to its rightful owner.',
    deliveredMessageNe: 'यो सामान सफलतापूर्वक मालिकलाई फिर्ता गरिएको छ।'
  },
  {
    id: 41, type: 'lost', status: 'active',
    userId: 101, userName: 'Suman Shrestha', userAvatar: 'SS',
    location: 'Basantapur, Kathmandu', locationNe: 'बसन्तपुर, काठमाडौं',
    time: '8 days ago', timeNe: '८ दिन अघि',
    title: 'Handwoven Dhaka Topi', titleNe: 'ढाका टोपी',
    description: 'Lost traditional dhaka topi near Basantapur temple steps.',
    descriptionNe: 'बसन्तपुरमा ढाका टोपी हराएको।',
    category: 'accessories', subcategory: 'other', date: '2026-09-07', image: null
  },
  {
    id: 42, type: 'found', status: 'active',
    userId: 102, userName: 'Anisha Gurung', userAvatar: 'AG',
    location: 'Pulchowk, Lalitpur', locationNe: 'पुल्चोक, ललितपुर',
    time: '3 days ago', timeNe: '३ दिन अघि',
    title: 'Bicycle Helmet — White', titleNe: 'सेतो साइकल हेल्मेट',
    description: 'Found white bicycle helmet near Pulchowk Campus gate.',
    descriptionNe: 'पुल्चोकमा साइकल हेल्मेट भेटियो।',
    category: 'vehicle', subcategory: 'helmet', date: '2026-09-12', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
  },
  {
    id: 43, type: 'lost', status: 'under_verification',
    userId: 103, userName: 'Ramesh Maharjan', userAvatar: 'RM',
    location: 'Bhrikutimandap, Kathmandu', locationNe: 'भृकुटीमण्डप, काठमाडौं',
    time: '6 days ago', timeNe: '६ दिन अघि',
    title: 'SEE Marksheet Envelope', titleNe: 'SEE मार्कसीट खाम',
    description: 'Lost SEE marksheet envelope near Bhrikutimandap.',
    descriptionNe: 'भृकुटीमण्डप नजिकै मार्कसीट हराएको।',
    category: 'documents', subcategory: 'certificate', date: '2026-09-09', image: null
  },
  {
    id: 44, type: 'found', status: 'suspicious',
    userId: 104, userName: 'Pratik Shakya', userAvatar: 'PS',
    location: 'Indrachowk, Kathmandu', locationNe: 'इन्द्रचोक, काठमाडौं',
    time: '10 days ago', timeNe: '१० दिन अघि',
    title: 'Gold-looking Chain', titleNe: 'सुनजस्तो चेन',
    description: 'Found chain near Indrachowk. Multiple conflicting claims.',
    descriptionNe: 'इन्द्रचोकमा चेन भेटियो। दावी बाझिएका।',
    category: 'accessories', subcategory: 'jewelry', date: '2026-09-05', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop'
  },
  {
    id: 45, type: 'lost', status: 'active',
    userId: 105, userName: 'Nisha Thapa', userAvatar: 'NT',
    location: 'Sitapaila, Kathmandu', locationNe: 'सीतापाइला, काठमाडौं',
    time: '5 days ago', timeNe: '५ दिन अघि',
    title: 'Tablet — Samsung A8', titleNe: 'स्यामसुङ ट्याब्लेट A8',
    description: 'Lost Samsung Tab A8 in microbus Kalanki to Sitapaila.',
    descriptionNe: 'सीतापाइला जाने माइक्रोबसमा ट्याब्लेट हराएको।',
    category: 'devices', subcategory: 'tablet', date: '2026-09-10', image: null
  },
  {
    id: 46, type: 'found', status: 'owner_found',
    userId: 106, userName: 'Bikash Adhikari', userAvatar: 'BA',
    location: 'Kapan, Kathmandu', locationNe: 'कपन, काठमाडौं',
    time: '2 weeks ago', timeNe: '२ हप्ता अघि',
    title: 'House Key with Wooden Tag', titleNe: 'काठको ट्याग भएको साँचो',
    description: 'Owner found and verified.',
    descriptionNe: 'मालिक भेटियो।',
    category: 'keys', subcategory: 'house_keys', date: '2026-08-22', image: 'https://images.unsplash.com/photo-1582139329536-da3e388f6e38?w=400&h=300&fit=crop',
    deliveredDate: '2026-09-01', retentionDaysLeft: 10,
    deliveredMessage: 'This item has been successfully returned to its rightful owner.',
    deliveredMessageNe: 'यो सामान सफलतापूर्वक मालिकलाई फिर्ता गरिएको छ।'
  },
  {
    id: 47, type: 'lost', status: 'active',
    userId: 107, userName: 'Sita Rai', userAvatar: 'SR',
    location: 'New Road, Kathmandu', locationNe: 'न्यू रोड, काठमाडौं',
    time: '2 days ago', timeNe: '२ दिन अघि',
    title: 'Shopping Tote with Cosmetics', titleNe: 'सजधज सामान भएको झोला',
    description: 'Lost beige tote near Bishal Bazar, New Road.',
    descriptionNe: 'न्यू रोडमा झोला हराएको।',
    category: 'accessories', subcategory: 'bag', date: '2026-09-13', image: null
  },
  {
    id: 48, type: 'found', status: 'active',
    userId: 108, userName: 'Hari Poudel', userAvatar: 'HP',
    location: 'Bouddha, Kathmandu', locationNe: 'बौद्ध, काठमाडौं',
    time: '1 hour ago', timeNe: '१ घण्टा अघि',
    title: 'Cat — Orange Tabby', titleNe: 'सुन्तला रङको बिरालो',
    description: 'Friendly orange tabby found near Bouddha stupa.',
    descriptionNe: 'बौद्ध नजिकै बिरालो भेटियो।',
    category: 'animals', subcategory: 'cat', date: '2026-09-14', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop'
  },
  {
    id: 49, type: 'lost', status: 'active',
    userId: 109, userName: 'Manisha KC', userAvatar: 'MK',
    location: 'Gongabu, Kathmandu', locationNe: 'गोंगबु, काठमाडौं',
    time: '4 hours ago', timeNe: '४ घण्टा अघि',
    title: 'Black Wallet — Men', titleNe: 'पुरुषको कालो पर्स',
    description: 'Lost black bifold wallet near Buspark Gongabu ticket counter.',
    descriptionNe: 'गोंगबुमा पर्स हराएको।',
    category: 'accessories', subcategory: 'wallet', date: '2026-09-14', image: null
  },
  {
    id: 50, type: 'found', status: 'claim_pending',
    userId: 110, userName: 'Dipesh Tamang', userAvatar: 'DT',
    location: 'Minbhawan, Kathmandu', locationNe: 'मिनभवन, काठमाडौं',
    time: '7 days ago', timeNe: '७ दिन अघि',
    title: 'AirPods Pro Case', titleNe: 'एयरपड्स प्रो केस',
    description: 'Found AirPods Pro case at Civil Hospital waiting area. Claim pending.',
    descriptionNe: 'सिभिल अस्पतालमा एयरपड्स केस भेटियो।',
    category: 'devices', subcategory: 'earbuds', date: '2026-09-08', image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&h=300&fit=crop'
  }
];

/* Personal notifications/activity live in localStorage via auth.js — never seed fake personal events here */

const MOCK_CLAIMS = [
  {
    id: 1, postId: 2, status: 'under_investigation', investigation: 'normal',
    claimant: { name: 'Ramesh Maharjan', phone: '9809876543', email: 'ramesh@email.com', address: 'Baneshwor, Kathmandu' },
    ownership: 'The wallet has my citizenship card photocopy and a family photo. Scratch on left corner.',
    submittedDate: '2026-09-01', dayOfSeven: 3, notes: 'Documents look consistent. Awaiting full 7-day period.'
  },
  {
    id: 2, postId: 8, status: 'suspicious', investigation: 'suspicious',
    claimant: { name: 'Unknown User', phone: '9811111111', email: 'fake@email.com', address: 'Unknown' },
    ownership: 'This is my card.',
    submittedDate: '2026-09-03', dayOfSeven: 1, notes: 'Vague ownership details. Flagged for fraud review.'
  },
  {
    id: 3, postId: 14, status: 'resolved', investigation: 'resolved',
    claimant: { name: 'Sita Rai', phone: '9841122334', email: 'sita@email.com', address: 'Chabahil' },
    ownership: 'Watch serial matches purchase receipt.',
    submittedDate: '2026-08-29', dayOfSeven: 7, notes: 'Verified and delivered.'
  }
];

const REWARD_LEVELS = [
  { id: 'bronze', icon: '🥉', en: 'Bronze Helper', ne: 'कांस्य सहायक', min: 0, max: 99 },
  { id: 'silver', icon: '🥈', en: 'Silver Helper', ne: 'रजत सहायक', min: 100, max: 499 },
  { id: 'gold', icon: '🥇', en: 'Gold Helper', ne: 'स्वर्ण सहायक', min: 500, max: 999 },
  { id: 'hero', icon: '🏆', en: 'Community Hero', ne: 'सामुदायिक नायक', min: 1000, max: Infinity }
];

const INFO_TYPES = [
  { id: 'found', en: 'I found this item', ne: 'मैले यो सामान भेटाएँ' },
  { id: 'saw', en: 'I saw this item', ne: 'मैले यो सामान देखेँ' },
  { id: 'know', en: 'I know where it may be', ne: 'यहाँ हुन सक्छ भन्ने थाहा छ' },
  { id: 'other', en: 'Other', ne: 'अन्य' }
];

function getCategory(catId) {
  return CATEGORIES.find(c => c.id === catId);
}

function getCategoryLabel(catId, lang) {
  const cat = getCategory(catId);
  return cat ? (lang === 'ne' ? cat.ne : cat.en) : catId;
}

function getSubcategoryLabel(catId, subId, lang) {
  const cat = getCategory(catId);
  if (!cat) return subId;
  const sub = cat.subcategories.find(s => s.id === subId);
  return sub ? (lang === 'ne' ? sub.ne : sub.en) : subId;
}

function getPostById(id) {
  if (id == null || id === '') return null;
  if (typeof findPostById === 'function') {
    const live = findPostById(id);
    if (live) return live;
  }
  return MOCK_POSTS.find(p => String(p.id) === String(id)) || null;
}

function getPostsByType(type) {
  return MOCK_POSTS.filter(p => p.type === type);
}

function getUserLevel(points) {
  return REWARD_LEVELS.find(l => points >= l.min && points <= l.max) || REWARD_LEVELS[0];
}

function filterPosts(posts, filters) {
  let result = [...posts];
  const q = (filters.query || '').toLowerCase().trim();
  if (q) {
    result = result.filter(p =>
      [p.title, p.titleNe, p.description, p.descriptionNe, p.location, p.userName, p.category, p.subcategory]
        .filter(Boolean).join(' ').toLowerCase().includes(q)
    );
  }
  if (filters.type && filters.type !== 'all') result = result.filter(p => p.type === filters.type);
  if (filters.category) result = result.filter(p => p.category === filters.category);
  if (filters.subcategory) result = result.filter(p => p.subcategory === filters.subcategory);
  if (filters.location) {
    const loc = filters.location.toLowerCase();
    result = result.filter(p => (p.location || '').toLowerCase().includes(loc));
  }
  if (filters.date) result = result.filter(p => p.date === filters.date);
  return result;
}
