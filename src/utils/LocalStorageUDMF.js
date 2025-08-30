class LocalStorageUDMF {

    constructor() {
        this.storage = window.localStorage;
    }
    
    get(key) {
        const value = this.storage.getItem(key);
        return value ? JSON.parse(value) : null;
    }
    
    set(key, value) {
        this.storage.setItem(key, JSON.stringify(value));
    }
    
    remove(key) {
        this.storage.removeItem(key);
    }
    
    clear() {
        this.storage.clear();
    }

    //Criar funcao populate que recebe um formulario e preenche os campos com os valores do localstorage
    populate(formulario) {
        // const keys = Object.keys(formulario);
        // for (const key of keys) {
        //     const value = this.get(key);
        //     if (value !== null) {
        //         formulario[key] = value;
        //     }
        // }
    }
}

export { LocalStorageUDMF };
