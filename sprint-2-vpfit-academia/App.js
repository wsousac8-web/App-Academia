import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator
} from 'react-native';
import { validarLogin, emailValido } from './GestorDados/auth';
import {
  PLANOS,
  STATUS,
  listarAlunos,
  cadastrarAluno,
  atualizarAluno,
  excluirAluno,
} from './GestorDados/api';

export default function App() {
  const [telaAtual, setTelaAtual] = useState('welcome');
  const [alunos, setAlunos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  const navegarPara = (tela) => setTelaAtual(tela);

  const entrar = (usuario) => {
    setUsuarioLogado(usuario);
    setTelaAtual('dashboard');
    carregarAlunos();
  };

  const sair = () => {
    setUsuarioLogado(null);
    setTelaAtual('welcome');
  };

  // Busca os alunos no banco (via backend)
  const carregarAlunos = async () => {
    setCarregando(true);
    const resultado = await listarAlunos();
    if (resultado.ok && Array.isArray(resultado.dados)) {
      setAlunos(resultado.dados);
    } else {
      alert(resultado.erro || 'Resposta inesperada do servidor.');
    }
    setCarregando(false);
  };

  // Carrega assim que o app abre — isso também "acorda" o servidor do Render antes do login
  useEffect(() => {
    carregarAlunos();
  }, []);

  // As três funções abaixo devolvem true/false para a tela saber se pode limpar o formulário
  const adicionarAluno = async (novoAluno) => {
    const resultado = await cadastrarAluno(novoAluno);
    if (!resultado.ok) {
      alert(resultado.erro);
      return false;
    }
    await carregarAlunos();
    alert('Aluno cadastrado com sucesso no banco de dados!');
    return true;
  };

  const alterarAluno = async (id, alteracoes) => {
    const resultado = await atualizarAluno(id, alteracoes);
    if (!resultado.ok) {
      alert(resultado.erro);
      return false;
    }
    await carregarAlunos();
    alert('Aluno atualizado com sucesso!');
    return true;
  };

  const removerAluno = async (id) => {
    const resultado = await excluirAluno(id);
    if (!resultado.ok) {
      alert(resultado.erro);
      return false;
    }
    await carregarAlunos();
    alert('Aluno excluído.');
    return true;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {telaAtual === 'welcome' && <WelcomeScreen onNavigate={navegarPara} />}
      {telaAtual === 'login' && <LoginScreen onNavigate={navegarPara} onLogin={entrar} />}
      {telaAtual === 'recovery' && <RecoveryScreen onNavigate={navegarPara} />}
      {/* O dashboard só é exibido se houver um administrador autenticado */}
      {telaAtual === 'dashboard' && usuarioLogado && (
        <DashboardScreen
          usuario={usuarioLogado}
          onLogout={sair}
          alunos={alunos}
          onAdicionarAluno={adicionarAluno}
          onAlterarAluno={alterarAluno}
          onExcluirAluno={removerAluno}
          carregando={carregando}
        />
      )}
    </SafeAreaView>
  );
}

// --- 1. TELA DE BOAS VINDAS ---
function WelcomeScreen({ onNavigate }) {
  return (
    <View style={styles.containerCenter}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('./assets/LogoVPFIT.jpg')} 
          style={styles.logoImage} 
          resizeMode="contain"
        />
        <Text style={styles.brandTitle}>VPFIT</Text>
        <Text style={styles.brandSubtitle}>GESTÃO DE ACADEMIA</Text>
      </View>
      
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.buttonPrimary} onPress={() => onNavigate('login')}>
          <Text style={styles.buttonText}>Acessar Sistema</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.buttonSecondary} onPress={() => alert('Suporte: suporte@vpfit.com')}>
          <Text style={styles.buttonSecondaryText}>Preciso de Suporte</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- 2. TELA DE LOGIN ---
function LoginScreen({ onNavigate, onLogin }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [entrando, setEntrando] = useState(false);

  const fazerLogin = async () => {
    if (entrando) return;

    if (!email.trim() || !senha) {
      setErro('Preencha o e-mail e a senha.');
      return;
    }
    if (!emailValido(email)) {
      setErro('Digite um e-mail válido.');
      return;
    }

    setErro('');
    setEntrando(true);
    const resultado = await validarLogin(email, senha);
    setEntrando(false);

    if (resultado.ok) {
      onLogin(resultado.usuario);
    } else {
      setErro(resultado.erro);
      setSenha('');
    }
  };

  return (
    <View style={styles.containerCenter}>
      <View style={styles.floatingCard}>
        <Text style={styles.title}>Acesso Restrito</Text>
        <Text style={styles.subtitle}>Faça login com sua conta de administrador</Text>
        
        <View style={styles.formContainer}>
          <TextInput 
            style={styles.input} 
            placeholder="✉️  E-mail" 
            placeholderTextColor="#777777"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={(texto) => { setEmail(texto); setErro(''); }}
          />
          <TextInput
            style={styles.input}
            placeholder="🔒  Senha"
            placeholderTextColor="#777777"
            secureTextEntry
            value={senha}
            onChangeText={(texto) => { setSenha(texto); setErro(''); }}
            onSubmitEditing={fazerLogin}
          />

          {erro ? <Text style={styles.errorText}>{erro}</Text> : null}

          <TouchableOpacity onPress={() => onNavigate('recovery')} style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.buttonPrimary, entrando && { opacity: 0.6 }]}
            onPress={fazerLogin}
            disabled={entrando}
          >
            {entrando
              ? <ActivityIndicator color="#FFFFFF" />
              : <Text style={styles.buttonText}>Entrar</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonGhost} onPress={() => onNavigate('welcome')}>
            <Text style={styles.buttonGhostText}>Voltar ao Início</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// --- 3. TELA DE RECUPERAÇÃO DE SENHA ---
function RecoveryScreen({ onNavigate }) {
  return (
    <View style={styles.containerCenter}>
      <View style={styles.floatingCard}>
        <Text style={styles.title}>Recuperar Senha</Text>
        <Text style={styles.subtitle}>Enviaremos as instruções de recuperação para o seu e-mail.</Text>
        
        <View style={styles.formContainer}>
          <TextInput 
            style={styles.input} 
            placeholder="✉️  E-mail cadastrado" 
            placeholderTextColor="#777777"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TouchableOpacity style={styles.buttonPrimary} onPress={() => {
            alert('Link de recuperação enviado com sucesso!');
            onNavigate('login');
          }}>
            <Text style={styles.buttonText}>Enviar Link</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonGhost} onPress={() => onNavigate('login')}>
            <Text style={styles.buttonGhostText}>Voltar para o Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// Linha de botões para escolher uma opção (usada para plano e status)
function Opcoes({ valores, selecionado, onSelecionar }) {
  return (
    <View style={styles.optionsRow}>
      {valores.map((valor) => (
        <TouchableOpacity
          key={valor}
          style={[styles.optionButton, selecionado === valor && styles.optionSelected]}
          onPress={() => onSelecionar(valor)}
        >
          <Text style={[styles.optionText, selecionado === valor && styles.optionTextSelected]}>{valor}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// --- 4. TELA DO DASHBOARD GERENCIAL ---
function DashboardScreen({ usuario, onLogout, alunos, onAdicionarAluno, onAlterarAluno, onExcluirAluno, carregando }) {
  const [exibirFormularioCadastro, setExibirFormularioCadastro] = useState(false);
  const [exibirFormularioPlanos, setExibirFormularioPlanos] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // Cadastro
  const [nomeNovo, setNomeNovo] = useState('');
  const [planoNovo, setPlanoNovo] = useState('Mensal');
  const [statusNovo, setStatusNovo] = useState('Ativo');

  // Alteração / exclusão
  const [idSelecionado, setIdSelecionado] = useState(null);
  const [planoEdicao, setPlanoEdicao] = useState('Mensal');
  const [statusEdicao, setStatusEdicao] = useState('Ativo');
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  const alunoSelecionado = alunos.find((a) => a.id === idSelecionado) || null;

  // Cálculos dinâmicos baseados nos dados vindos do banco
  const totalAlunos = alunos.length;
  const ativos = alunos.filter(a => a.status === 'Ativo').length;
  const inativos = alunos.filter(a => a.status === 'Inativo').length;
  const pendentes = alunos.filter(a => a.status === 'Pendente').length;

  // Mais recentes primeiro
  const alunosRecentes = [...alunos].reverse();

  const salvarNovoAluno = async () => {
    const nome = nomeNovo.trim();
    if (!nome) {
      alert('Digite o nome do aluno.');
      return;
    }
    if (salvando) return;

    setSalvando(true);
    const ok = await onAdicionarAluno({ nome, plano: planoNovo, status: statusNovo });
    setSalvando(false);

    // Só limpa o formulário se o servidor confirmou o cadastro
    if (ok) {
      setNomeNovo('');
      setPlanoNovo('Mensal');
      setStatusNovo('Ativo');
      setExibirFormularioCadastro(false);
    }
  };

  const selecionarAluno = (aluno) => {
    setIdSelecionado(aluno.id);
    setPlanoEdicao(aluno.plano);
    setStatusEdicao(aluno.status);
    setConfirmandoExclusao(false);
  };

  const salvarAlteracao = async () => {
    if (!alunoSelecionado || salvando) return;
    if (planoEdicao === alunoSelecionado.plano && statusEdicao === alunoSelecionado.status) {
      alert('Nada foi alterado.');
      return;
    }
    setSalvando(true);
    await onAlterarAluno(alunoSelecionado.id, { plano: planoEdicao, status: statusEdicao });
    setSalvando(false);
  };

  const excluirSelecionado = async () => {
    if (!alunoSelecionado || salvando) return;
    // Primeiro toque pede confirmação; o segundo exclui
    if (!confirmandoExclusao) {
      setConfirmandoExclusao(true);
      return;
    }
    setSalvando(true);
    const ok = await onExcluirAluno(alunoSelecionado.id);
    setSalvando(false);
    setConfirmandoExclusao(false);
    if (ok) setIdSelecionado(null);
  };

  return (
    <View style={styles.dashboardContainer}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={styles.miniLogo}><Text style={styles.miniLogoText}>V</Text></View>
          <View>
            <Text style={styles.headerTitle}>VPFIT Admin</Text>
            {usuario?.nome ? <Text style={styles.headerSubtitle}>Olá, {usuario.nome}</Text> : null}
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>👥 Visão Geral de Alunos</Text>

        <View style={styles.row}>
          <View style={[styles.card, styles.cardFeatured]}>
            <Text style={styles.cardLabelFeatured}>Total Matriculados</Text>
            <Text style={styles.cardValueFeatured}>{totalAlunos}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>🟢 Ativos</Text>
            <Text style={styles.cardValue}>{ativos}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>🔴 Inativos</Text>
            <Text style={styles.cardValue}>{inativos}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>⏳ Pendentes</Text>
            <Text style={styles.cardValueAlert}>{pendentes}</Text>
          </View>
        </View>

        {/* BOTÃO 1: ALTERAÇÃO DE PLANOS */}
        <TouchableOpacity
          style={[styles.buttonPrimary, { marginVertical: 5 }]}
          onPress={() => {
            setExibirFormularioPlanos(!exibirFormularioPlanos);
            setExibirFormularioCadastro(false);
            setConfirmandoExclusao(false);
          }}
        >
          <Text style={styles.buttonText}>
            {exibirFormularioPlanos ? '✖️ Fechar Alteração' : '⚙️ Alteração de Planos'}
          </Text>
        </TouchableOpacity>

        {exibirFormularioPlanos && (
          <View style={styles.formCard}>
            <Text style={styles.titleForm}>Alterar Plano de Aluno</Text>

            {alunos.length === 0 ? (
              <Text style={styles.helperText}>Nenhum aluno cadastrado ainda.</Text>
            ) : (
              <>
                <Text style={styles.labelOption}>Selecione o aluno:</Text>
                {alunosRecentes.map((aluno) => {
                  const selecionado = aluno.id === idSelecionado;
                  return (
                    <TouchableOpacity
                      key={aluno.id}
                      style={[styles.alunoOption, selecionado && styles.optionSelected]}
                      onPress={() => selecionarAluno(aluno)}
                    >
                      <Text style={[styles.alunoOptionNome, selecionado && styles.optionTextSelected]}>{aluno.nome}</Text>
                      <Text style={[styles.alunoOptionInfo, selecionado && styles.optionTextSelected]}>
                        {aluno.plano} · {aluno.status}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}

            {alunoSelecionado && (
              <View style={styles.edicaoBox}>
                <Text style={styles.labelOption}>Novo plano de {alunoSelecionado.nome}:</Text>
                <Opcoes valores={PLANOS} selecionado={planoEdicao} onSelecionar={setPlanoEdicao} />

                <Text style={styles.labelOption}>Status:</Text>
                <Opcoes valores={STATUS} selecionado={statusEdicao} onSelecionar={setStatusEdicao} />

                <TouchableOpacity
                  style={[styles.buttonPrimary, salvando && { opacity: 0.6 }]}
                  onPress={salvarAlteracao}
                  disabled={salvando}
                >
                  {salvando
                    ? <ActivityIndicator color="#FFFFFF" />
                    : <Text style={styles.buttonText}>Salvar Alterações</Text>}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.buttonDanger, confirmandoExclusao && styles.buttonDangerConfirm]}
                  onPress={excluirSelecionado}
                  disabled={salvando}
                >
                  <Text style={styles.buttonDangerText}>
                    {confirmandoExclusao ? 'Toque de novo para confirmar a exclusão' : '🗑️ Excluir Aluno'}
                  </Text>
                </TouchableOpacity>
                {confirmandoExclusao && (
                  <TouchableOpacity style={styles.buttonGhost} onPress={() => setConfirmandoExclusao(false)}>
                    <Text style={styles.buttonGhostText}>Cancelar exclusão</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}

        {/* BOTÃO 2: CADASTRO DE ALUNO */}
        <TouchableOpacity
          style={[styles.buttonPrimary, { marginVertical: 5 }]}
          onPress={() => {
            setExibirFormularioCadastro(!exibirFormularioCadastro);
            setExibirFormularioPlanos(false);
          }}
        >
          <Text style={styles.buttonText}>
            {exibirFormularioCadastro ? '✖️ Cancelar Cadastro' : '➕ Cadastro de Aluno'}
          </Text>
        </TouchableOpacity>

        {exibirFormularioCadastro && (
          <View style={styles.formCard}>
            <Text style={styles.titleForm}>Novo Aluno</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome completo do aluno"
              placeholderTextColor="#777777"
              maxLength={100}
              value={nomeNovo}
              onChangeText={setNomeNovo}
            />

            <Text style={styles.labelOption}>Escolha o Plano:</Text>
            <Opcoes valores={PLANOS} selecionado={planoNovo} onSelecionar={setPlanoNovo} />

            <Text style={styles.labelOption}>Status Inicial:</Text>
            <Opcoes valores={STATUS} selecionado={statusNovo} onSelecionar={setStatusNovo} />

            <TouchableOpacity
              style={[styles.buttonPrimary, { marginTop: 15 }, salvando && { opacity: 0.6 }]}
              onPress={salvarNovoAluno}
              disabled={salvando}
            >
              {salvando
                ? <ActivityIndicator color="#FFFFFF" />
                : <Text style={styles.buttonText}>Salvar Aluno no Servidor</Text>}
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>📋 Lista Recente de Alunos</Text>

        {carregando ? (
          <ActivityIndicator size="large" color="#8B0000" style={{ marginVertical: 20 }} />
        ) : alunos.length === 0 ? (
          <Text style={styles.helperText}>Nenhum aluno cadastrado ainda.</Text>
        ) : (
          alunosRecentes.map((aluno) => (
            <View key={aluno.id} style={styles.listItem}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.listName}>{aluno.nome}</Text>
                <Text style={styles.listPlan}>Plano {aluno.plano}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                aluno.status === 'Ativo' ? styles.badgeActive :
                aluno.status === 'Pendente' ? styles.badgeWarning : styles.badgeInactive
              ]}>
                <Text style={styles.badgeText}>{aluno.status}</Text>
              </View>
            </View>
          ))
        )}

        <View style={{height: 50}} />
      </ScrollView>
    </View>
  );
}

// --- ESTILIZAÇÃO ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050505', 
  },
  containerCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#050505',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoImage: {
    width: 150,
    height: 150,
    marginBottom: 15,
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF', 
    letterSpacing: 2,
  },
  brandSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#990000', 
    letterSpacing: 4,
    marginTop: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  titleForm: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 14,
    color: '#A0A0A0', 
    textAlign: 'center',
    marginBottom: 25,
    paddingHorizontal: 10,
    lineHeight: 20,
  },
  floatingCard: {
    backgroundColor: '#121212', 
    width: '100%',
    borderRadius: 24,
    padding: 25,
    borderWidth: 1,
    borderColor: '#2A0000', 
    shadowColor: '#990000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  formCard: {
    backgroundColor: '#121212',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#8B0000',
  },
  actionContainer: {
    width: '100%',
    paddingHorizontal: 10,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: '#0A0A0A', 
    borderRadius: 14,
    padding: 16,
    marginBottom: 15,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#333333',
  },
  labelOption: {
    color: '#A0A0A0',
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '600',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    padding: 10,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333333',
    marginHorizontal: 4,
  },
  optionSelected: {
    backgroundColor: '#8B0000',
    borderColor: '#FF4D4D',
  },
  optionText: {
    color: '#A0A0A0',
    fontSize: 12,
    fontWeight: 'bold',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  errorText: {
    color: '#FF4D4D',
    fontSize: 14,
    fontWeight: '600',
    marginTop: -5,
    marginBottom: 10,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 25,
  },
  forgotPasswordText: {
    color: '#FF4D4D', 
    fontWeight: '700',
    fontSize: 14,
  },
  buttonPrimary: {
    backgroundColor: '#8B0000', 
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#8B0000', 
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonSecondaryText: {
    color: '#FF4D4D',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonGhost: {
    alignItems: 'center',
    padding: 10,
  },
  buttonGhostText: {
    color: '#A0A0A0',
    fontSize: 15,
    fontWeight: '600',
  },
  dashboardContainer: {
    flex: 1,
    backgroundColor: '#050505',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#121212',
    borderBottomWidth: 1,
    borderBottomColor: '#2A0000',
  },
  miniLogo: {
    width: 32,
    height: 32,
    backgroundColor: '#8B0000',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  miniLogoText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#A0A0A0',
    marginTop: 2,
  },
  helperText: {
    color: '#A0A0A0',
    fontSize: 13,
    marginBottom: 10,
  },
  alunoOption: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  alunoOptionNome: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  alunoOptionInfo: {
    color: '#A0A0A0',
    fontSize: 12,
    marginTop: 2,
  },
  edicaoBox: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#2A0000',
  },
  buttonDanger: {
    borderWidth: 1,
    borderColor: '#FF4D4D',
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 5,
  },
  buttonDangerConfirm: {
    backgroundColor: '#FF4D4D',
  },
  buttonDangerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#2A0000',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  logoutText: {
    color: '#FF4D4D',
    fontWeight: 'bold',
    fontSize: 14,
  },
  scrollArea: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 10,
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  card: {
    flex: 1,
    backgroundColor: '#121212', 
    padding: 20,
    borderRadius: 20,
    marginHorizontal: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#8B0000', 
  },
  cardFeatured: {
    marginHorizontal: 0,
    alignItems: 'center',
    backgroundColor: '#8B0000', 
    borderLeftWidth: 0,
  },
  cardLabel: {
    fontSize: 13,
    color: '#A0A0A0',
    marginBottom: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardLabelFeatured: {
    fontSize: 13,
    color: '#FFCCCC',
    marginBottom: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cardValueFeatured: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cardValueAlert: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FF4D4D', 
  },
  listItem: {
    backgroundColor: '#121212',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2A0000',
  },
  listName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listPlan: {
    color: '#A0A0A0',
    fontSize: 12,
    marginTop: 4,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  badgeActive: { backgroundColor: '#004d00' }, 
  badgeWarning: { backgroundColor: '#b35900' }, 
  badgeInactive: { backgroundColor: '#8B0000' }, 
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  }
});