import { handleLogout } from '../js/logout.js';
class LottieHeader extends HTMLElement {
   constructor() {
       super();
       this.loadProfileImage();
   }

   async loadProfileImage() {
       const email = localStorage.getItem('email');
       if (!email) {
           this.renderDefaultHeader();
           return;
       }

       try {
           const response = await fetch(
               `http://David-kakao-community-env-backend.eba-an3dmmwe.ap-northeast-2.elasticbeanstalk.com/api/user/profile-image/${email}`,
               {
                   headers: {
                       Accept: 'application/json',
                       'Content-Type': 'application/json',
                   },
               },
           );

           if (!response.ok) throw new Error('Failed to fetch profile image');
           const data = await response.json();
           
           // CloudFront URL 사용
           const imageUrl = data.imageUrl || 'https://d2t2xvt037aek.cloudfront.net/uploads/profiles/default.webp';
           this.renderHeader(imageUrl);
       } catch (error) {
           console.error('Profile image load failed:', error);
           this.renderDefaultHeader();
       }
   }

   renderDefaultHeader() {
       this.renderHeader('https://d2t2xvt037aek.cloudfront.net/uploads/profiles/default.webp');
   }

   renderHeader(imageUrl) {
       this.innerHTML = `
           <div class="header">
               <a href="posts.html" class="back-button" style="position: absolute; left: 20px; top: 50%; transform: translateY(-50%);">
                    <i class="fas fa-arrow-left"></i> Whisper Back
               </a>
               <h4 class="main-header-title">WhisperSpace</h4>
               <div class="user-menu">
                   <img src="${imageUrl}" 
                        alt="프로필" 
                        class="profile-small"
                        onerror="this.src='https://d2t2xvt037aek.cloudfront.net/uploads/profiles/default.webp'">
                   <div class="dropdown-menu">
                       <a href="edit-profile.html">회원정보수정</a>
                       <a href="change-password.html">비밀번호수정</a>
                       <a class="logout">로그아웃</a>
                   </div>
               </div>
           </div>
       `;
       this.initDropdown();
       this.initLottie();
       this.initLogout();
   }

   initDropdown() {
       const userMenu = this.querySelector('.user-menu');
       const dropdownMenu = this.querySelector('.dropdown-menu');
       userMenu.addEventListener('click', e => {
           e.stopPropagation();
           dropdownMenu.classList.toggle('show');
       });
       document.addEventListener('click', () => {
           if (dropdownMenu.classList.contains('show')) {
               dropdownMenu.classList.remove('show');
           }
       });
   }

   initLottie() {
       const backButton = this.querySelector('#back-button');
       const lottieAnimation = lottie.loadAnimation({
           container: backButton,
           renderer: 'svg',
           loop: false,
           autoplay: true,
           path: '../assets/animation.json',
       });
       backButton.addEventListener('click', () => {
           window.location.href = 'posts.html';
       });
   }

   initLogout() {
       const logoutButton = this.querySelector('.logout');
       logoutButton.addEventListener('click', handleLogout);
   }
}

customElements.define('lottie-header', LottieHeader);