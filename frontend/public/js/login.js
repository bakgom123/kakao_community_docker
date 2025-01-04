/**
 * 로그인 폼을 관리하는 클래스
 * 이메일/비밀번호 유효성 검사 및 로그인/회원가입 처리를 담당
 */
class LoginForm {
    /**
     * 생성자: 필요한 DOM 요소들을 초기화하고 참조를 저장
     */
    constructor() {
        // DOM 요소 참조 저장
        this.loginButton = document.getElementById('loginButton');
        this.signupButton = document.getElementById('signupButton');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.emailError = document.getElementById('emailError');
        this.passwordError = document.getElementById('passwordError');

        // 이벤트 리스너 초기화 실행
        this.initializeEventListeners();
    }

    /**
     * 필요한 이벤트 리스너들을 등록하는 메서드
     * - 입력 필드 유효성 검사
     * - 로그인/회원가입 버튼 클릭 처리
     */
    initializeEventListeners() {
        // 실시간 입력 유효성 검사
        this.emailInput.addEventListener('input', () =>
            this.validateEmailInput(),
        );
        this.passwordInput.addEventListener('input', () =>
            this.validatePasswordInput(),
        );

        // 버튼 클릭 이벤트 처리
        this.loginButton.addEventListener('click', () => this.handleLogin());
        this.signupButton.addEventListener('click', () => this.handleSignup());
    }

    /**
     * 이메일 유효성 검사 함수
     * @param {string} email - 검사할 이메일 주소
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
        // 비밀번호 규칙: 8-20자, 대소문자, 숫자, 특수문자 각 1개 이상 포함
        const passwordPattern =
            /(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;
        if (!password) return '비밀번호를 입력해주세요.';
        if (!passwordPattern.test(password)) {
            return '비밀번호는 8-20자이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
        }
        return '';
    }

    /**
     * 이메일 입력 필드 유효성 검사 실행 및 UI 업데이트
     */
    validateEmailInput() {
        const error = this.validateEmail(this.emailInput.value);
        // 오류 메시지 및 UI 상태 업데이트
        this.emailError.textContent = error;
        this.emailError.classList.toggle('show', error !== '');
        this.emailInput.parentElement.classList.toggle('error', error !== '');
    }

    /**
     * 비밀번호 입력 필드 유효성 검사 실행 및 UI 업데이트
     */
    validatePasswordInput() {
        const error = this.validatePassword(this.passwordInput.value);
        // 오류 메시지 및 UI 상태 업데이트
        this.passwordError.textContent = error;
        this.passwordError.classList.toggle('show', error !== '');
        this.passwordInput.parentElement.classList.toggle(
            'error',
            error !== '',
        );
    }

    /**
     * 로그인 처리 함수
     * - 입력값 유효성 검사
     * - 서버 로그인 요청
     * - 로그인 성공 시 사용자 정보 저장 및 페이지 이동
     */
    async handleLogin() {
        // 입력값 유효성 검사
        const emailValidation = this.validateEmail(this.emailInput.value);
        const passwordValidation = this.validatePassword(
            this.passwordInput.value,
        );

        // 유효성 검사 통과 시 로그인 시도
        if (!emailValidation && !passwordValidation) {
            try {
                const response = await fetch(
                    //'http://localhost:3000/auth/login',
                    'http://David-kakao-community-env-backend.eba-an3dmmwe.ap-northeast-2.elasticbeanstalk.com/api/auth/login',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                            email: this.emailInput.value,
                            password: this.passwordInput.value,
                        }),
                    },
                );

                if (response.ok) {
                    const data = await response.json();
                    // 로그인 성공: 사용자 정보 로컬 스토리지 저장
                    localStorage.setItem('email', this.emailInput.value);
                    localStorage.setItem('nickname', data.nickname);
                    // 메인 페이지로 이동
                    window.location.href = 'posts.html';
                } else {
                    const errorData = await response.json();
                    console.error(errorData.message);
                }
            } catch (error) {
                console.error('로그인 요청 중 오류 발생:', error);
            }
        }
    }

    /**
     * 회원가입 페이지로 이동
     */
    handleSignup() {
        window.location.href = 'signup.html';
    }
}

// DOM이 로드되면 LoginForm 인스턴스 생성
document.addEventListener('DOMContentLoaded', () => {
    new LoginForm();
});