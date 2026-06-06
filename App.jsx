import React, { useState, useEffect } from 'react';
import { authService } from './services/authService';
import { presenceService } from './services/presenceService';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Loader from './components/Loader';
import HomeScreen from './screens/HomeScreen';
import ChatScreen from './screens/ChatScreen';
import SearchScreen from './screens/SearchScreen';
import CreatePostScreen from './screens/CreatePostScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import './styles/global.css';

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeScreen, setActiveScreen] = useState('home'); 
  const [authView, setAuthView] = useState('login');

  useEffect(() => {
    const unsubscribe = authService.listenToAuth(async (currentUser, profileData) => {
      setUser(currentUser);
      setUserData(profileData);
      setLoading(false);
      
      if (currentUser) {
        presenceService.setOnline(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <Loader msg="Lexal Core Engine Synchronizing..." />;

  if (!user) {
    return authView === 'login' ? 
      <LoginScreen setAuthView={setAuthView} /> : 
      <RegisterScreen setAuthView={setAuthView} />;
  }

  return (
    <div className="lexal-app-container">
      <Navbar userData={userData} setActiveScreen={setActiveScreen} />
      
      <main className="main-viewport">
        {activeScreen === 'home' && <HomeScreen user={user} userData={userData} />}
        {activeScreen === 'chat' && <ChatScreen user={user} userData={userData} />}
        {activeScreen === 'search' && <SearchScreen user={user} userData={userData} />}
        {activeScreen === 'create' && <CreatePostScreen user={user} userData={userData} setActiveScreen={setActiveScreen} />}
        {activeScreen === 'profile' && <ProfileScreen user={user} userData={userData} targetUid={user.uid} />}
      </main>

      <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} user={user} />
    </div>
  );
}

export default App;

