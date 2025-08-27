import React, { useEffect, useState } from "react";
import "./home.css"; // 👈 Importa o CSS de estilo

const Home = () => {
  const [agendamentosProximos, setAgendamentosProximos] = useState([]);

  useEffect(() => {
    const dadosSalvos = localStorage.getItem("agendamentos");

    if (dadosSalvos) {
      const lista = JSON.parse(dadosSalvos);

      const agora = new Date();

      const agendamentosOrdenados = lista
        .map((ag) => ({
          ...ag,
          dataHora: new Date(ag.data + "T" + ag.hora),
        }))
        .filter((ag) => ag.dataHora >= agora)
        .sort((a, b) => a.dataHora - b.dataHora);

      setAgendamentosProximos(agendamentosOrdenados);
    }
  }, []);

  return (
    <>
      <h1>Home</h1>
      <p>Bem-vindo à sua página inicial</p>

      <h2>Próximos Agendamentos</h2>

      {agendamentosProximos.length === 0 ? (
        <p>Nenhum agendamento futuro encontrado.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {agendamentosProximos.map((ag, index) => (
            <li key={index} className="agendamento-item">
              <strong>{ag.titulo}</strong>
              <br />
              <span className="agendamento-info">
                📅 {new Date(ag.data).toLocaleDateString("pt-BR")} às {ag.hora}
              </span>
              {ag.recorrente && (
                <span
                  className="agendamento-repeticao"
                  title={`Agendamento ${ag.recorrente}`}
                >
                  {" "}
                  🔁 ({ag.recorrente})
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default Home;
