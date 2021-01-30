class FilesListCategories extends HTMLElement {
    constructor() {
      super();
      this.categoryId = this.getAttribute('categoryid');
      this.userId = Number(this.getAttribute('userid'));
    }
  
    connectedCallback() {
        this.loadCategories();
        window.loadCategories = this.loadCategories;
    }
  
    disconnectedCallback() {
        delete window.loadCategories;
    }

    onDragOver(e) {
        e.currentTarget.classList.add('droppable-over');
        e.dataTransfer.dropEffect = 'copy';
    }

    onDragLeave(e) {
        e.currentTarget.classList.remove('droppable-over');
    }

    onDrop = (e) => {
        e.currentTarget.classList.remove('droppable-over');
        const draggableEl = document.getElementById(e
            .dataTransfer
            .getData('text'));
        const fileId = draggableEl.getAttribute('data-id');
        const categoryId = e.currentTarget.getAttribute('data-categoryid');
        fetch(`/api/v1/files/${fileId}/category/${categoryId ? categoryId : 'NaN'}`)
            .then(() => {
                draggableEl.remove();
            })
            .catch(e => {
                console.log(e);
                alert('Cannot change file\'s category!');
            });
    }

    loadCategories = () => {
        return fetch(`/api/v1/categories`)
            .then(res => res.json())
            .then((res) => {
                if (res.status === 'error') window.renderLogin();

                this.renderCategories(res);
            })
            .catch((_err) => {
                window.renderLogin();
            });
    }

    renderCategories(categories = []) {
        if (this.categoryId) {
            const activeCategory = categories.find(c => c._id === this.categoryId);
            window.document.title = `TgCloud: ${activeCategory.categoryTitle}`;
        } else {
            window.document.title = `TgCloud`;
        }

        this.innerHTML = `
            <ul class="categories">
                <li>
                    <a href="/" class="droppable${!this.categoryId ? ' active' : ''}">
                        No Category
                    </a>
                </li>
                ${categories.map(c => (
                    `<li>
                        <a href="/category/${c._id}" id="category-${c._id}" data-categoryid="${c._id}" class="droppable${c._id === this.categoryId ? ' active' : ''}">
                            ${c.categoryTitle}
                            ${c.isPrivate ? '' : `<small class="shared">
                            <img src="/img/user-group.svg" alt="shared" />
                            </small>`}
                        </a>
                    </li>`
                )).join('')}
            </ul>
        `;

        document.querySelectorAll('.droppable').forEach(el => {
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                el.addEventListener(eventName, (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                }, true);
            })
            el.addEventListener('dragover', this.onDragOver);
            el.addEventListener('dragleave', this.onDragLeave);
            el.addEventListener('drop', this.onDrop);
        })
    }
  }

customElements.define("files-list-categories", FilesListCategories);
