class Header extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
            <div class="header">
                <h4 class="header-title">아무 말 대잔치</h4>
            </div>
        `;
    }
}

customElements.define('header-component', Header);
