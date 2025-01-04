/**
 * 회원가입 폼을 관리하는 클래스
 * 입력값 검증, 프로필 이미지 처리, 서버 통신을 담당
 */
class SignupForm {
    constructor() {
        this.initializeElements(); // DOM 요소 초기화
        this.initializeEventListeners(); // 이벤트 리스너 설정
        this.profileImageData = null; // 프로필 이미지 데이터 저장
    }

    /**
     * 필요한 DOM 요소들의 참조를 저장하는 메서드
     */
    initializeElements() {
        // 입력 필드 요소들
        this.profileUpload = document.getElementById('profileUpload');
        this.profilePreview = document.getElementById('profilePreview');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.passwordConfirmInput = document.getElementById('passwordConfirm');
        this.nicknameInput = document.getElementById('nickname');

        // 버튼 요소들
        this.signupButton = document.getElementById('signupButton');
        this.loginLink = document.getElementById('loginLink');

        // 에러 메시지 요소들
        this.emailError = document.getElementById('emailError');
        this.passwordError = document.getElementById('passwordError');
        this.passwordConfirmError = document.getElementById(
            'passwordConfirmError',
        );
        this.nicknameError = document.getElementById('nicknameError');
    }

    /**
     * 이벤트 리스너들을 등록하는 메서드
     */
    initializeEventListeners() {
        // 프로필 이미지 관련 이벤트
        if (this.profilePreview && this.profileUpload) {
            this.profilePreview.addEventListener('click', () =>
                this.profileUpload.click(),
            );
            this.profileUpload.addEventListener(
                'change',
                this.handleProfileImage,
            );
        }

        // 입력 필드 유효성 검사 이벤트
        this.emailInput.addEventListener('input', this.validateEmailInput);
        this.passwordInput.addEventListener(
            'input',
            this.validatePasswordInput,
        );
        this.passwordConfirmInput.addEventListener(
            'input',
            this.validatePasswordConfirmInput,
        );
        this.nicknameInput.addEventListener(
            'input',
            this.validateNicknameInput,
        );

        // 버튼 클릭 이벤트
        this.signupButton.addEventListener('click', this.handleSignup);
        this.loginLink.addEventListener('click', this.handleLoginLink);
    }

    /**
     * 프로필 이미지 선택 처리 함수
     */
    handleProfileImage = event => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = e => {
                this.profilePreview.src = e.target.result;
                this.profileImageData = e.target.result; // Base64 이미지 데이터 저장
            };
            reader.readAsDataURL(file);
        }
    };

    /**
     * 이메일 유효성 검사 함수
     * @param {string} email - 검사할 이메일
     * @returns {string} 오류 메시지 (유효한 경우 빈 문자열)
     */
    validateEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) return '이메일을 입력해주세요.';
        if (email.length < 5) return '이메일이 너무 짧습니다.';
        if (!emailPattern.test(email)) return '올바른 이메일 형식이 아닙니다.';
        return '';
    }

    /**
     * 비밀번호 유효성 검사 함수
     * @param {string} password - 검사할 비밀번호
     * @returns {string} 오류 메시지 (유효한 경우 빈 문자열)
     */
    validatePassword(password) {
        const passwordPattern =
            /(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;
        if (!password) return '비밀번호를 입력해주세���.';
        if (!passwordPattern.test(password)) {
            return '비밀번호는 8-20자이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
        }
        return '';
    }

    /**
     * 비밀번호 확인 검사 함수
     */
    validatePasswordConfirm(password, passwordConfirm) {
        if (!passwordConfirm) return '비밀번호를 한번 더 입력해주세요.';
        if (password !== passwordConfirm)
            return '비밀번호가 일치하지 않습니다.';
        return '';
    }

    /**
     * 닉네임 유효성 검사 함수
     */
    validateNickname(nickname) {
        if (!nickname) return '닉네임을 입력해주세요.';
        if (nickname.length < 2 || nickname.length > 10) {
            return '닉네임은 2자 이상 10자 이하여야 합니다.';
        }
        return '';
    }

    /**
     * 에러 메시지 표시 함수
     */
    displayError(input, error) {
        const errorElement = this[`${input}Error`];
        errorElement.textContent = error;
        errorElement.classList.toggle('show', error !== '');
        this[input + 'Input'].parentElement.classList.toggle(
            'error',
            error !== '',
        );
    }

    // 각 입력 필드별 유효성 검사 실행 함수들
    validateEmailInput = () => {
        this.displayError('email', this.validateEmail(this.emailInput.value));
    };

    validatePasswordInput = () => {
        this.displayError(
            'password',
            this.validatePassword(this.passwordInput.value),
        );
    };

    validatePasswordConfirmInput = () => {
        const error = this.validatePasswordConfirm(
            this.passwordInput.value,
            this.passwordConfirmInput.value,
        );
        this.displayError('passwordConfirm', error);
    };

    validateNicknameInput = () => {
        this.displayError(
            'nickname',
            this.validateNickname(this.nicknameInput.value),
        );
    };

    /**
     * 회원가입 처리 함수
     * - 모든 입력값 유효성 검사
     * - 서버에 회원가입 요청
     * - 성공 시 로그인 페이지로 이동
     */
    handleSignup = () => {
        // 모든 입력값 최종 검증
        const emailValidation = this.validateEmail(this.emailInput.value);
        const passwordValidation = this.validatePassword(
            this.passwordInput.value,
        );
        const passwordConfirmValidation = this.validatePasswordConfirm(
            this.passwordInput.value,
            this.passwordConfirmInput.value,
        );
        const nicknameValidation = this.validateNickname(
            this.nicknameInput.value,
        );

        // 모든 검증 통과 시 서버에 요청
        if (
            !emailValidation &&
            !passwordValidation &&
            !passwordConfirmValidation &&
            !nicknameValidation
        ) {
            const userData = {
                email: this.emailInput.value,
                password: this.passwordInput.value,
                nickname: this.nicknameInput.value,
                profileImage: this.profileImageData || 'default.webp',
            };
            fetch('http://David-kakao-community-env-backend.eba-an3dmmwe.ap-northeast-2.elasticbeanstalk.com/api/auth/signup', {
            //fetch('http://localhost:3000/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('회원가입 성공');
                        window.location.href = 'login.html';
                    } else {
                        alert(data.message || '회원가입 실패');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('서버 오류가 발생했습니다.');
                });
        } else {
            // 유효성 검사 실패 시 에러 메시지 표시
            this.displayError('email', emailValidation);
            this.displayError('password', passwordValidation);
            this.displayError('passwordConfirm', passwordConfirmValidation);
            this.displayError('nickname', nicknameValidation);
        }
    };

    /**
     * 로그인 페이지로 이동하는 함수
     */
    handleLoginLink = () => {
        window.location.href = 'login.html';
    };
}

// DOM이 로드되면 SignupForm 인스턴스 생성
document.addEventListener('DOMContentLoaded', () => {
    new SignupForm();
});