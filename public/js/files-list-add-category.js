class FilesListAddCategory extends HTMLElement {
    constructor() {
      super();
      this.categoryTitle = '';
    }
  
    connectedCallback() {
        this.renderForm();
    }
  
    disconnectedCallback() {
        
    }

    addCategory(e) {
        e.preventDefault();
        const titleEl = document.getElementById('add-category-form-title');
        const categoryTitle = titleEl.value;

        if (categoryTitle) {
            fetch(`/api/v1/categories/add`, {
                method: 'post',
                body: JSON.stringify({
                    categoryTitle,
                }),
                headers: {
                    'Content-Type': 'application/json',
                }
            })
                .then(res => res.json())
                .then((res) => {
                    if (res.status === 'error') window.renderLogin();

                    window.loadCategories();
                    titleEl.value = '';
                })
                .catch((_err) => {
                    window.renderLogin();
                });
        }
    }

    renderForm() {

        this.innerHTML = `
            <form id="add-category-form">
                <h4>Create Category</h4>
                <div class="add-category-form">
                    <input type="text" required value="${this.categoryTitle}" id="add-category-form-title" />
                    <button>+</button>
                </div>
            </form>
        `;

        document.getElementById('add-category-form').addEventListener('submit', this.addCategory);
    }
  }

customElements.define("files-list-add-category", FilesListAddCategory);
