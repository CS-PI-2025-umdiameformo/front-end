class LocalStorageUDMF {
    handleSubmit = (e) => {
        e.preventDefault();
        const formErrors = validateForm();
        if (Object.keys(formErrors).length === 0) {
            console.log('Dados do formulário enviados:', formData);
            setErrors({});
            setIsSubmitted(true);
            // alert('Usuário cadastrado com sucesso! (Simulação)');

            // Limpar o formulário e o localStorage após o envio
            localStorage.removeItem(LOCAL_STORAGE_KEY);

            setFormData({
                name: '',
                email: '',
                password: '',
                confirmPassword: '',
            });

            // // Redireciona para a página de login
            // navigate("/login");
        } else {
            setErrors(formErrors);
            setIsSubmitted(false);
        }
    };

    handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
        // Limpa o erro do campo específico ao ser modificado
        if (errors[name]) {
            setErrors(prevErrors => ({
                ...prevErrors,
                [name]: undefined,
            }));
        }
        setIsSubmitted(false); // Reseta o estado de submissão se o usuário começar a editar novamente
    };
}
