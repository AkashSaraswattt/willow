export const translations = {
  en: {
    // App
    appName: 'Willow',
    
    // Navbar
    logout: 'Logout',
    
    // Sidebar
    contacts: 'Contacts',
    showOnlineOnly: 'Show online only',
    online: 'Online',
    offline: 'Offline',
    noFriends: 'No friends yet',
    noOnlineFriends: 'No online friends',
    
    // Chat
    typeMessage: 'Type a message...',
    noChatSelected: 'No chat selected',
    selectChat: 'Select a chat to start messaging',
    
    // Profile
    profile: 'Profile',
    profileInfo: 'Your profile information',
    fullName: 'Full Name',
    emailAddress: 'Email Address',
    accountInfo: 'Account Information',
    memberSince: 'Member Since',
    accountStatus: 'Account Status',
    active: 'Active',
    
    // Settings
    settings: 'Settings',
    language: 'Language',
    chooseLanguage: 'Choose your preferred language',
    theme: 'Theme',
    chooseTheme: 'Choose a theme for your chat interface',
    preview: 'Preview',
    
    // Discover
    discoverFriends: 'Discover Friends',
    findConnect: 'Find and connect with new people',
    searchFriends: 'Search for friends...',
    searchResults: 'Search Results',
    discoverPeople: 'Discover People',
    friendRequests: 'Friend Requests',
    sentRequests: 'Sent Requests',
    noRequests: 'No friend requests',
    noPending: 'No pending requests',
    
    // Auth
    welcomeBack: 'Welcome Back',
    signInAccount: 'Sign in to your account',
    email: 'Email',
    password: 'Password',
    signIn: 'Sign in',
    dontHaveAccount: "Don't have an account?",
    createAccount: 'Create account',
    
    // Common
    loading: 'Loading...',
    send: 'Send',
    cancel: 'Cancel',
    accept: 'Accept',
    reject: 'Reject',
    welcomeToWillow: 'Welcome to Willow!',
    findPeopleConnect: 'Find people and send a request to connect',
    chooseAiAssistant: 'Choose an AI assistant to start chatting',
    
    // Groups
    groupChats: 'Group Chats',
    createJoinGroups: 'Create or join group conversations with your friends',
    createGroup: 'Create Group',
    joinGroup: 'Join Group',
    groupName: 'Group Name',
    enterGroupName: 'Enter group name',
    joinCode: 'Join Code',
    enterJoinCode: 'Enter 8-character code',
    create: 'Create',
    join: 'Join',
  },
  
  hi: {
    // App
    appName: 'विलो',
    
    // Navbar
    logout: 'लॉगआउट',
    
    // Sidebar
    contacts: 'संपर्क',
    showOnlineOnly: 'केवल ऑनलाइन दिखाएं',
    online: 'ऑनलाइन',
    offline: 'ऑफलाइन',
    noFriends: 'अभी तक कोई मित्र नहीं',
    noOnlineFriends: 'कोई ऑनलाइन मित्र नहीं',
    
    // Chat
    typeMessage: 'संदेश लिखें...',
    noChatSelected: 'कोई चैट चयनित नहीं',
    selectChat: 'संदेश भेजने के लिए एक चैट चुनें',
    
    // Profile
    profile: 'प्रोफ़ाइल',
    profileInfo: 'आपकी प्रोफ़ाइल जानकारी',
    fullName: 'पूरा नाम',
    emailAddress: 'ईमेल पता',
    accountInfo: 'खाता जानकारी',
    memberSince: 'सदस्य बने',
    accountStatus: 'खाता स्थिति',
    active: 'सक्रिय',
    
    // Settings
    settings: 'सेटिंग्स',
    language: 'भाषा',
    chooseLanguage: 'अपनी पसंदीदा भाषा चुनें',
    theme: 'थीम',
    chooseTheme: 'अपने चैट इंटरफ़ेस के लिए एक थीम चुनें',
    preview: 'पूर्वावलोकन',
    
    // Discover
    discoverFriends: 'मित्र खोजें',
    findConnect: 'नए लोगों को खोजें और जुड़ें',
    searchFriends: 'मित्रों को खोजें...',
    searchResults: 'खोज परिणाम',
    discoverPeople: 'लोगों को खोजें',
    friendRequests: 'मित्र अनुरोध',
    sentRequests: 'भेजे गए अनुरोध',
    noRequests: 'कोई मित्र अनुरोध नहीं',
    noPending: 'कोई लंबित अनुरोध नहीं',
    
    // Auth
    welcomeBack: 'वापसी पर स्वागत है',
    signInAccount: 'अपने खाते में साइन इन करें',
    email: 'ईमेल',
    password: 'पासवर्ड',
    signIn: 'साइन इन करें',
    dontHaveAccount: 'खाता नहीं है?',
    createAccount: 'खाता बनाएं',
    
    // Common
    loading: 'लोड हो रहा है...',
    send: 'भेजें',
    cancel: 'रद्द करें',
    accept: 'स्वीकार करें',
    reject: 'अस्वीकार करें',
    welcomeToWillow: 'विलो में आपका स्वागत है!',
    findPeopleConnect: 'लोगों को खोजें और जुड़ने के लिए अनुरोध भेजें',
    chooseAiAssistant: 'चैट शुरू करने के लिए एक AI सहायक चुनें',
    
    // Groups
    groupChats: 'समूह चैट',
    createJoinGroups: 'अपने मित्रों के साथ समूह बातचीत बनाएं या उनमें शामिल हों',
    createGroup: 'समूह बनाएं',
    joinGroup: 'समूह में शामिल हों',
    groupName: 'समूह का नाम',
    enterGroupName: 'समूह का नाम दर्ज करें',
    joinCode: 'जॉइन कोड',
    enterJoinCode: '8-अक्षर का कोड दर्ज करें',
    create: 'बनाएं',
    join: 'शामिल हों',
  }
};

export const useTranslation = () => {
  const language = localStorage.getItem('app-language') || 'en';
  
  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };
  
  return { t, language };
};
