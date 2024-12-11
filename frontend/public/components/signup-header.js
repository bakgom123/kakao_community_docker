class SignupHeader extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
            <div class="header">
                <div class="lottie-back-button" id="back-button"></div>
                <h4 class="main-header-title">아무 말 대잔치</h4>
            </div>
        `;
        this.initLottie();
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
            window.location.href = 'login.html';
        });
    }
}

customElements.define('signup-header', SignupHeader);
