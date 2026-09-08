import React from "react";
import { useState, useEffect } from "react";
import { listarPacientes, cadastrarPaciente, excluirPaciente, atualizarPaciente } from "../services/pacienteService";
const pacienteInicial = {
    nome: "",
    cpf: "",
    telefone: "",
    dataNascimento: ""
};

export default function PacientesPage() {
    const [pacientes, setPacientes] = useState([]);
    const [paciente, setPaciente] = useState(pacienteInicial);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [pacienteEmEdicao, setPacienteEmEdicao] = useState(null);
    const [excluindoId, setExcluindoId] = useState(null);


    useEffect(() => {
        carregarPacientes();
    }, []);

    function iniciarEdicao(paciente) {
        setPacienteEmEdicao(paciente);
        setPaciente({
            nome: paciente.nome,
            cpf: paciente.cpf,
            telefone: paciente.telefone,
            dataNascimento: paciente.dataNascimento.slice(0, 10)
        });
        setErro("");
        setMensagem("");
    }

    function cancelarEdicao() {
        setPacienteEmEdicao(null);
        setPaciente(pacienteInicial);
    }

    async function removerPaciente(paciente) {
        const confirmou = window.confirm(
            `Deseja excluir o paciente ${paciente.nome}?`
        );
        if (!confirmou) return;
        try {
            setExcluindoId(paciente.id);
            setErro("");
            await excluirPaciente(paciente.id);

            setPacientes(atual => atual.filter(item => item.id !== paciente.id));
        } catch (error) {
            setErro(error.mensage);
        } finally {
            setExcluindoId(null);
        }
    }

    async function carregarPacientes() {
        try {
            setCarregando(true);
            setErro("");
            const dados = await listarPacientes();
            setPacientes(dados);
        } catch (error) {
            setErro(error.mensage);
        } finally {
            setCarregando(false);
        }
    }

    function alterarCampo(event) {
        const { name, value } = event.target;
        console.log("name", name, "valor", value);
        setPaciente(atual => ({ ...atual, [name]: value }));
    }

    async function salvarPacinte(event) {
        event.preventDefault();
        if (!paciente.nome.trim()) {
            setErro("Infome o nome do paciente")
            return;
        }
        try {
            setSalvando(true);
            setErro("");
            setMensagem("");

            if (pacienteEmEdicao) {
                const pacienteAtualizado = await
                    atualizarPaciente(pacienteEmEdicao.id, paciente);
                setPacientes(atual => atual.map(paciente =>
                    paciente.id === pacienteAtualizado.id ? pacienteAtualizado : paciente));
                setMensagem("Paciente atualzado com sucesso");

            }
            else {
                const novoPaciente = await cadastrarPaciente(paciente);
                setPacientes(estadoAtual => [...estadoAtual, novoPaciente]);
                setPaciente(pacienteInicial);
                setMensagem("Paciente cadastrado com sucesso");
            }
            cancelarEdicao();
        } catch (error) {
            setErro(error.message);
        } finally {
            setSalvando(false);
        }
    }
    return (
        <main>
            <h1>Pacientes</h1>
            {erro && <p>{erro}</p>}
            {mensagem && <p>{mensagem}</p>}
            <form onSubmit={salvarPacinte}>
                <input name="nome" placeholder="Nome" value={paciente.nome} onChange={alterarCampo}>
                </input>
                <input name="cpf" placeholder="CPF" value={paciente.cpf} onChange={alterarCampo}>
                </input>
                <input name="telefone" placeholder="Telefone" value={paciente.telefone} onChange={alterarCampo}>
                </input>
                <input name="dataNascimento" placeholder="Data de Nascimento" value={paciente.dataNascimento} onChange={alterarCampo}>
                </input>
                <button disabled={salvando}>
                    {salvando 
                    ? "Salvando" 
                    : pacienteEmEdicao ? "Salvar alterações"    
                    :"Cadastrar"}
                </button>
                        {pacienteEmEdicao && (
                            <button type="button" onClick={cancelarEdicao}>
                                Cancelar
                            </button>
                        )}
            </form>

            <section>
                <div>
                    <h2>Pacientes Cadastrados</h2>
                    <button type="button" onClick={carregarPacientes}>Atualizar</button>
                </div>
                {carregando ? (<p>Carregando</p>)
                    : pacientes.length === 0 ? (<p>Nenhum paciente cadastrado</p>)
                        : (pacientes.map(paciente => (
                            <article key={paciente.id}>
                                <strong>{paciente.nome}</strong>
                                <strong> {paciente.cpf}</strong>
                                <strong> {paciente.telefone}</strong>
                                <button type="button" onClick={
                                    () => iniciarEdicao(paciente)}>Editar
                                </button>
                                <button type="button"
                                onClick={() => removerPaciente(paciente)}
                                disabled={excluindoId === paciente.id}
                                >
                                    {excluindoId === paciente.id
                                     ? "Exluindo..." 
                                     :"Excluir"}
                                </button>

                            </article>
                        )))

                }
            </section>
        </main>
    )
}