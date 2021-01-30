class Filters extends HTMLElement {
    constructor() {
      super();
    }
  
    connectedCallback() {
        this.render();
    }
  
    disconnectedCallback() {
        
    }

    static get observedAttributes() {
        return ['filters'];
    }

    attributeChangedCallback(_name, _oldValue, _newValue) {
        this.render();
    }

    render() {
        const filters = JSON.parse(this.getAttribute('filters').replace(/~/g, '"'));

        const btns = [
            {
                name: 'Name',
                id: 'nameFilter',
                field: 'originalName',
            },
            {
                name: 'Created',
                id: 'createdFilter',
                field: 'updatedAt',
            },
            {
                name: 'Size',
                id: 'sizeFilter',
                field: 'originalSize',
            },
        ];

        this.innerHTML = `
            <div class="filters">
                <div>
                    <input type="checkbox" class="file-checkbox" id="select-all-files" />
                </div>
                ${btns.map(btn => {
                    const filter = {sort: { [btn.field]: filters.sort[btn.field] ? filters.sort[btn.field] * -1 : 1 }};
                    return `
                    <div
                        id="${btn.id}"
                        class="${filters.sort && filters.sort[btn.field] ? `${filters.sort[btn.field] === 1 ? 'arrow-up' : 'arrow-down'}` : ''}"
                        onclick='window.loadFiles(${JSON.stringify(filter)})'
                    >
                        <button>${btn.name}</button>
                    </div>
                `;
                }).join('')}
            </div>
        `;

        document.getElementById('select-all-files').addEventListener('change', window.selectAllFiles);
    }
  }

customElements.define("file-filters", Filters);
