/**
 * 비밀번호 변경 폼을 관리하는 클래스
 * 새 비밀번호 입력 및 확인, 유효성 검사, 변경 처리를 담당
 */
class passwordForm {
    constructor() {
        this.initializeElements();
        this.initializeEventListeners();
    }

    /**
     * 필요한 DOM 요소들을 초기화하고 참조를 저장하는 메서드
     */
    initializeElements() {
        // 입력 필드 요소
        this.passwordInput = document.getElementById('password');
        this.passwordConfirmInput = document.getElementById('passwordConfirm');
        this.signupButton = document.getElementById('signupButton');

        // 에러 메시지 표시 요소
        this.passwordError = document.getElementById('passwordError');
        this.passwordConfirmError = document.getElementById(
            'passwordConfirmError',
        );
    }

    /**
     * 이벤트 리스너들을 등록하는 메서드
     * - 실시간 비밀번호 유효성 검사
     * - 비��번호 변경 버튼 클릭 처리
     */
    initializeEventListeners() {
        this.passwordInput.addEventListener('input', () => {
            this.validatePasswordInput();
            // 비밀번호가 변경될 때마다 비밀번호 확인 필드도 검증 -> 먼저 비밀번호 확인을 입력할 경우
            if (this.passwordConfirmInput.value) {
                this.validatePasswordConfirmInput();
            }
        });
        this.passwordConfirmInput.addEventListener('input', () =>
            this.validatePasswordConfirmInput(),
        );
        this.signupButton.addEventListener('click', () =>
            this.handlePassword(),
        );
    }

    /**
     * 비밀번호 유효성 검사 함수
     * @param {string} password - 검사할 비밀번호
     * @returns {string} 오류 메시지 (유효한 경우 빈 문자열)
     */
    validatePassword(password) {
        // 비밀번호 규칙: 8-20자, 대소문자, 숫자, 특수문자 각 1개 이�� 포함
        const passwordPattern =
            /(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;
        if (!password) return '비밀번호를 입력해주세요.';
        if (!passwordPattern.test(password)) {
            return '비밀번호는 8-20자이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
        }
        return '';
    }

    /**
     * 비밀번호 확인 유효성 검사 함수
     * @param {string} password - 원래 비밀번호
     * @param {string} passwordConfirm - 확인용 비밀번호
     * @returns {string} 오류 메시지 (유효한 경우 빈 문자열)
     */
    validatePasswordConfirm(password, passwordConfirm) {
        if (!passwordConfirm) return '비밀번호를 한번 더 입력해주세요.';
        if (password !== passwordConfirm)
            return '비밀번호가 일치하지 않습니다.';
        return '';
    }

    /**
     * 비밀번호 입력 필드 유효성 검사 실행 및 UI ���데이트
     */
    validatePasswordInput() {
        const error = this.validatePassword(this.passwordInput.value);
        this.passwordError.textContent = error;
        this.passwordError.classList.toggle('show', error !== '');
        this.passwordInput.parentElement.classList.toggle(
            'error',
            error !== '',
        );
    }

    /**
     * 비밀번호 확인 필드 유효성 검사 실행 및 UI 업데이트
     */
    validatePasswordConfirmInput() {
        const error = this.validatePasswordConfirm(
            this.passwordInput.value,
            this.passwordConfirmInput.value,
        );
        this.passwordConfirmError.textContent = error;
        this.passwordConfirmError.classList.toggle('show', error !== '');
        this.passwordConfirmInput.parentElement.classList.toggle(
            'error',
            error !== '',
        );
    }

    /**
     * 비밀번호 변경 처리 함수
     * - 입력값 유효성 검사
     * - ���버 비밀번호 변경 요청
     * - 성공 시 페이지 이동
     */
    async handlePassword() {
        // 최종 유효성 검사
        const passwordValidation = this.validatePassword(
            this.passwordInput.value,
        );
        const passwordConfirmValidation = this.validatePasswordConfirm(
            this.passwordInput.value,
            this.passwordConfirmInput.value,
        );

        // 유효성 검사 통과 시 비밀번호 변경 시도
        if (!passwordValidation && !passwordConfirmValidation) {
            try {
                const response = await fetch(
                    //'http://localhost:3000/user/change-password',
                    'http://David-kakao-community-env-backend.eba-an3dmmwe.ap-northeast-2.elasticbeanstalk.com/api/user/change-password',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: localStorage.getItem('email'),
                            newPassword: this.passwordInput.value,
                        }),
                    },
                );

                const result = await response.json();

                if (result.success) {
                    alert('비밀번호가 성공적으로 변경되었습니다.');
                    this.signupButton.style.backgroundColor = '#7F6AEE';
                    // 0.5초 후 페이지 이동
                    setTimeout(() => {
                        window.location.href = 'posts.html';
                    }, 500);
                } else {
                    alert(
                        `비밀번호 변경 실패: ${result.message || '알 수 없는 오류'}`,
                    );
                }
            } catch (error) {
                console.error('비밀번호 변경 요청 중 오류 발생:', error);
                alert('서버 오류가 발생했습니다. 다시 시도해주세요.');
            }
        } else {
            // 유효성 검사 실패 시 UI 업데이트
            this.passwordError.classList.toggle(
                'show',
                passwordValidation !== '',
            );
            this.passwordConfirmError.classList.toggle(
                'show',
                passwordConfirmValidation !== '',
            );

            this.passwordInput.parentElement.classList.toggle(
                'error',
                passwordValidation !== '',
            );
            this.passwordConfirmInput.parentElement.classList.toggle(
                'error',
                passwordConfirmValidation !== '',
            );
        }
    }
}

// DOM이 로드되면 passwordForm 인스턴스 생성
document.addEventListener('DOMContentLoaded', () => {
    new passwordForm();
});