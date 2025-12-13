import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { criarUsuario } from '../../utils/api';
import './cadastroUsuario.css';

const LOCAL_STORAGE_KEY = 'userLastRegistrationFormData';

/**
 * @function UserRegistrationPage
 * @description Componente funcional para a página de cadastro de usuário.
 * Gerencia o estado do formulário, lida com a submissão dos dados e
 * salva/recupera o estado do formulário do localStorage.
 */
function UserRegistrationPage() {
  // --- Estados do Componente ---
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate(); // Inicializa o hook useNavigate

  // --- Efeitos (Hooks) ---

  /**
   * @effect
   * @description Carrega os dados do formulário do localStorage quando o componente é montado.
   * Roda apenas uma vez após a montagem inicial.
   */
  useEffect(() => {
    const savedFormData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        // Verifica se parsedData é um objeto e não null antes de atualizar o estado
        if (parsedData && typeof parsedData === 'object') {
          setFormData(parsedData);
        } else {
          // Se os dados não forem válidos, remove-os para evitar problemas futuros
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      } catch (error) {
        console.error("Erro ao parsear dados do localStorage:", error);
        // Opcional: limpar localStorage se os dados estiverem corrompidos
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  }, []); // Array de dependências vazio executa apenas na montagem e desmontagem

  /**
   * @effect
   * @description Salva os dados do formulário no localStorage sempre que 'formData' muda.
   * @param {object} formData - O estado atual do formulário.
   */
  useEffect(() => {
    // Evita salvar um objeto vazio no localStorage se todos os campos estiverem limpos
    // (o que pode acontecer após um submit bem-sucedido antes da remoção explícita)
    const isEmpty = Object.values(formData).every(value => value === '');
    if (!isEmpty) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData]);

  // --- Funções ---

  /**
   * @function handleChange
   * @description Atualiza o estado 'formData' conforme o usuário digita nos campos do formulário.
   * @param {object} e - O evento de mudança do input.
   */
  const handleChange = (e) => {
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

  /**
   * @function validateForm
   * @description Valida os dados do formulário antes da submissão.
   * @returns {object} - Um objeto contendo os erros de validação.
   */
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'O nome é obrigatório.';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'O email é obrigatório.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'O formato do email é inválido.';
    }
    if (!formData.password) {
      newErrors.password = 'A senha é obrigatória.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres.';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'A confirmação de senha é obrigatória.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem.';
    }
    return newErrors;
  };

  /**
   * @function handleSubmit
   * @description Lida com a submissão do formulário.
   * Valida os dados e, se válidos, envia para a API.
   * @param {object} e - O evento de submissão do formulário.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length === 0) {
      try {
        await criarUsuario(formData);
        
        setErrors({});
        setIsSubmitted(true);
        alert('Usuário cadastrado com sucesso!');

        // Limpar o formulário e o localStorage após o envio
        localStorage.removeItem(LOCAL_STORAGE_KEY);

        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
        });

        // Redireciona para a página de login
        navigate("/login");
      } catch (error) {
        // Trata erro de duplicidade retornado pela API
        if (error.duplicado) {
          const campo = error.campo.toLowerCase();
          setErrors({
            [campo]: error.mensagem
          });
        } else {
          alert('Erro ao cadastrar usuário. Tente novamente.');
        }
        setIsSubmitted(false);
      }
    } else {
      setErrors(formErrors);
      setIsSubmitted(false);
    }
  };

  // --- Renderização ---
  return (
    <>
      {isSubmitted && Object.keys(errors).length === 0 && (
        <p className="form-success-message">Cadastro realizado com sucesso!</p>
      )}

      <form className="formulario" onSubmit={handleSubmit}>
        <h1>Cadastre-se</h1>
        <div className="form-container">
          <div className="form-group">
            <label htmlFor="name" className="form-label">Nome Completo:</label>
            <input
              type="text"
              id="name"
              name="name"
              className={`form-input ${errors.name ? 'input-error' : ''}`}
              value={formData.name}
              onChange={handleChange}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && <p id="name-error" className="error-message">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              value={formData.email}
              onChange={handleChange}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && <p id="email-error" className="error-message">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Senha:</label>
            <input
              type="password"
              id="password"
              name="password"
              className={`form-input ${errors.password ? 'input-error' : ''}`}
              value={formData.password}
              onChange={handleChange}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            {errors.password && <p id="password-error" className="error-message">{errors.password}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirmar Senha:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
              value={formData.confirmPassword}
              onChange={handleChange}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
            />
            {errors.confirmPassword && <p id="confirmPassword-error" className="error-message">{errors.confirmPassword}</p>}
          </div>
        </div>

        <button type="submit" className="form-button">Cadastrar</button>
      </form>
    </>
  );
}

export default UserRegistrationPage;