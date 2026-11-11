import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import TabBar from "./TabBar";

const dicasSustentaveis = [
  {
    titulo: "Leve sua garrafa reutilizável",
    texto: "Use uma garrafa durável no dia a dia para evitar copos e garrafas descartáveis.",
  },
  {
    titulo: "Separe os recicláveis",
    texto: "Mantenha papel, plástico, vidro e metal separados dos resíduos orgânicos e rejeitos.",
  },
  {
    titulo: "Dê preferência a sacolas reutilizáveis",
    texto: "Tenha uma ecobag por perto para reduzir o uso de sacolas descartáveis nas compras.",
  },
  {
    titulo: "Economize água ao escovar os dentes",
    texto: "Feche a torneira durante a escovação e abra apenas para enxaguar.",
  },
  {
    titulo: "Apague as luzes ao sair",
    texto: "Desligue as luzes de ambientes vazios e aproveite a iluminação natural sempre que possível.",
  },
  {
    titulo: "Planeje suas refeições",
    texto: "Organize as compras e aproveite os alimentos antes que estraguem para reduzir o desperdício.",
  },
  {
    titulo: "Prefira caminhar ou pedalar",
    texto: "Em trajetos curtos e seguros, escolha ir a pé ou de bicicleta em vez de usar o carro.",
  },
  {
    titulo: "Desligue aparelhos sem uso",
    texto: "Retire carregadores da tomada e desligue equipamentos quando não estiverem sendo usados.",
  },
  {
    titulo: "Reutilize potes e embalagens",
    texto: "Dê uma nova utilidade a recipientes limpos antes de descartá-los.",
  },
  {
    titulo: "Recicle o óleo de cozinha",
    texto: "Guarde o óleo usado em uma garrafa fechada e leve-o a um ponto de coleta apropriado.",
  },
  {
    titulo: "Prefira produtos com menos embalagem",
    texto: "Ao fazer compras, escolha opções duráveis, refis ou produtos com embalagens recicláveis.",
  },
  {
    titulo: "Use a máquina de lavar cheia",
    texto: "Espere juntar roupas suficientes para usar a máquina com eficiência e economizar água e energia.",
  },
  {
    titulo: "Faça compostagem dos orgânicos",
    texto: "Restos de frutas, verduras e borra de café podem virar adubo por meio da compostagem.",
  },
  {
    titulo: "Conserte antes de substituir",
    texto: "Avalie se roupas, móveis e aparelhos podem ser reparados ou doados antes de comprar novos.",
  },
  {
    titulo: "Leve sua própria caneca",
    texto: "No trabalho ou em cafeterias, use uma caneca reutilizável em vez de copos descartáveis.",
  },
  {
    titulo: "Escolha alimentos da estação",
    texto: "Frutas e verduras da estação costumam precisar de menos transporte e armazenamento prolongado.",
  },
  {
    titulo: "Compre somente o necessário",
    texto: "Faça uma lista antes de ir às compras para evitar excessos e desperdício.",
  },
  {
    titulo: "Aproveite integralmente os alimentos",
    texto: "Quando apropriado, use talos, cascas e folhas em receitas, sempre depois de higienizá-los.",
  },
  {
    titulo: "Armazene os alimentos corretamente",
    texto: "Organize a geladeira e identifique sobras para consumi-las antes que estraguem.",
  },
  {
    titulo: "Congele porções que não vai usar",
    texto: "Congele alimentos antes que estraguem e marque a data para lembrar de consumi-los.",
  },
  {
    titulo: "Prefira produtos locais",
    texto: "Quando possível, compre de produtores e comércios locais para fortalecer a economia da região.",
  },
  {
    titulo: "Leve recipientes para compras a granel",
    texto: "Use potes ou sacos reutilizáveis em estabelecimentos que aceitam esse tipo de recipiente.",
  },
  {
    titulo: "Evite talheres descartáveis",
    texto: "Tenha um conjunto reutilizável na bolsa para refeições fora de casa.",
  },
  {
    titulo: "Recuse brindes que não vai usar",
    texto: "Antes de aceitar um item promocional, pense se ele será realmente útil para você.",
  },
  {
    titulo: "Prefira pilhas recarregáveis",
    texto: "Em aparelhos de uso frequente compatíveis, pilhas recarregáveis ajudam a reduzir descartes.",
  },
  {
    titulo: "Descarte pilhas em pontos de coleta",
    texto: "Não coloque pilhas e baterias no lixo comum; procure um ponto de coleta apropriado.",
  },
  {
    titulo: "Leve eletrônicos antigos para coleta",
    texto: "Celulares, cabos e aparelhos sem uso devem ser encaminhados a pontos de coleta de eletrônicos.",
  },
  {
    titulo: "Use a impressão frente e verso",
    texto: "Quando precisar imprimir, use os dois lados do papel sempre que o documento permitir.",
  },
  {
    titulo: "Cuide dos livros que já tem",
    texto: "Empreste, troque ou doe livros em bom estado para que outras pessoas também possam usá-los.",
  },
  {
    titulo: "Experimente trocar roupas",
    texto: "Organize uma troca com amigos ou familiares para renovar o guarda-roupa sem comprar peças novas.",
  },
  {
    titulo: "Doe roupas em bom estado",
    texto: "Encaminhe peças limpas e utilizáveis a instituições ou pessoas que possam aproveitá-las.",
  },
  {
    titulo: "Escolha roupas duráveis",
    texto: "Ao comprar, avalie a qualidade e se a peça combina com o que você já usa.",
  },
  {
    titulo: "Lave roupas com água fria quando possível",
    texto: "Confira as etiquetas: muitos tecidos podem ser lavados em água fria, reduzindo o gasto de energia.",
  },
  {
    titulo: "Prefira secar roupas no varal",
    texto: "Quando o clima e o espaço permitirem, o varal evita o uso da secadora.",
  },
  {
    titulo: "Feche a torneira ao ensaboar a louça",
    texto: "Deixe a água correr apenas para enxaguar e use uma bacia quando isso ajudar a economizar.",
  },
  {
    titulo: "Conserte vazamentos rapidamente",
    texto: "Uma torneira pingando pode desperdiçar água; procure consertá-la ou peça ajuda.",
  },
  {
    titulo: "Reaproveite água quando for seguro",
    texto: "Água limpa usada para lavar frutas pode servir para regar plantas, se não tiver detergente ou contaminantes.",
  },
  {
    titulo: "Regue as plantas nos horários mais frescos",
    texto: "Regar pela manhã ou no fim da tarde pode reduzir a evaporação em dias quentes.",
  },
  {
    titulo: "Escolha plantas adequadas ao clima local",
    texto: "Espécies adaptadas à região tendem a exigir cuidados e irrigação mais compatíveis com o ambiente.",
  },
  {
    titulo: "Varra a calçada em vez de usar mangueira",
    texto: "Para remover folhas e sujeira seca, use uma vassoura e reserve água para quando realmente precisar.",
  },
  {
    titulo: "Tome banhos mais curtos",
    texto: "Reduzir alguns minutos no banho ajuda a economizar água e a energia usada para aquecê-la.",
  },
  {
    titulo: "Aproveite a luz natural",
    texto: "Abra cortinas e persianas durante o dia para iluminar os ambientes sem acender lâmpadas.",
  },
  {
    titulo: "Prefira lâmpadas LED",
    texto: "Ao substituir uma lâmpada, considere uma LED compatível e descarte a antiga corretamente.",
  },
  {
    titulo: "Ative o modo de economia de energia",
    texto: "Use os recursos de economia de energia do computador e do celular quando forem convenientes.",
  },
  {
    titulo: "Ajuste o ar-condicionado com moderação",
    texto: "Mantenha portas e janelas fechadas durante o uso e escolha uma temperatura confortável.",
  },
  {
    titulo: "Limpe os filtros do ar-condicionado",
    texto: "Faça a manutenção conforme as instruções do fabricante para manter o aparelho funcionando bem.",
  },
  {
    titulo: "Prefira ventilação natural quando possível",
    texto: "Em dias agradáveis, abrir janelas pode arejar a casa sem ligar aparelhos de climatização.",
  },
  {
    titulo: "Cozinhe com a panela tampada",
    texto: "Manter a panela tampada pode ajudar os alimentos a cozinhar mais rápido e aproveitar melhor o calor.",
  },
  {
    titulo: "Use uma panela do tamanho adequado",
    texto: "Escolha uma panela compatível com a boca do fogão para evitar desperdício de calor.",
  },
  {
    titulo: "Descongele alimentos na geladeira",
    texto: "Planeje com antecedência e descongele na geladeira, seguindo boas práticas de segurança alimentar.",
  },
  {
    titulo: "Prefira transporte coletivo",
    texto: "Em trajetos atendidos e convenientes, ônibus e outros transportes coletivos podem substituir viagens de carro.",
  },
  {
    titulo: "Combine caronas com segurança",
    texto: "Quando fizer sentido, compartilhe o trajeto com pessoas de confiança e combine os detalhes com antecedência.",
  },
  {
    titulo: "Planeje o trajeto antes de sair",
    texto: "Agrupe compromissos próximos para evitar deslocamentos repetidos.",
  },
  {
    titulo: "Mantenha os pneus calibrados",
    texto: "Verifique a pressão recomendada pelo fabricante para dirigir com segurança e eficiência.",
  },
  {
    titulo: "Faça a manutenção preventiva do veículo",
    texto: "Siga o plano de manutenção do fabricante para conservar o veículo e evitar problemas.",
  },
  {
    titulo: "Evite deixar o carro ligado parado",
    texto: "Se estiver estacionado por um período, desligue o motor quando for seguro fazê-lo.",
  },
  {
    titulo: "Use a bicicleta com equipamentos adequados",
    texto: "Em trajetos seguros, use capacete, iluminação e itens de sinalização conforme as regras locais.",
  },
  {
    titulo: "Descarte medicamentos em pontos apropriados",
    texto: "Leve medicamentos vencidos ou sem uso a farmácias ou pontos que recebam esse tipo de resíduo.",
  },
  {
    titulo: "Não descarte óleo na pia",
    texto: "O óleo pode entupir tubulações; armazene-o em recipiente fechado e encaminhe para coleta.",
  },
  {
    titulo: "Confira as regras de reciclagem da sua cidade",
    texto: "A coleta seletiva varia entre municípios; consulte as orientações locais para separar corretamente.",
  },
  {
    titulo: "Entregue embalagens limpas e secas",
    texto: "Retire restos de alimentos e deixe as embalagens escorrerem antes de colocá-las para reciclagem.",
  },
  {
    titulo: "Achate caixas de papelão",
    texto: "Desmonte caixas limpas para facilitar o armazenamento e o transporte até a coleta seletiva.",
  },
  {
    titulo: "Reutilize caixas de entrega",
    texto: "Guarde caixas limpas em bom estado para mudanças, armazenamento ou novos envios.",
  },
  {
    titulo: "Separe resíduos perigosos",
    texto: "Tintas, solventes e produtos químicos não devem ir ao lixo comum; procure orientação de descarte local.",
  },
  {
    titulo: "Escolha refis quando disponíveis",
    texto: "Refis podem reduzir embalagens, desde que sejam compatíveis com o produto e usados conforme o rótulo.",
  },
  {
    titulo: "Prefira panos reutilizáveis",
    texto: "Use panos laváveis em tarefas domésticas quando forem adequados, em vez de papel descartável.",
  },
  {
    titulo: "Leve uma marmita reutilizável",
    texto: "Use um recipiente próprio para refeições fora de casa e reduza embalagens descartáveis.",
  },
  {
    titulo: "Organize um ponto de reciclagem em casa",
    texto: "Reserve recipientes identificados para os materiais aceitos pela coleta seletiva local.",
  },
  {
    titulo: "Doe objetos que ainda funcionam",
    texto: "Antes de descartar um item em bom estado, veja se alguém pode reutilizá-lo.",
  },
  {
    titulo: "Empreste itens usados raramente",
    texto: "Compartilhe ferramentas e equipamentos com pessoas de confiança quando não precisar usá-los ao mesmo tempo.",
  },
  {
    titulo: "Considere produtos de segunda mão",
    texto: "Para alguns itens, comprar usado em bom estado prolonga sua vida útil e evita uma compra nova.",
  },
  {
    titulo: "Leve uma sacola para recolher seu lixo",
    texto: "Em passeios e trilhas, carregue de volta tudo o que levou e descarte corretamente.",
  },
  {
    titulo: "Cuide dos espaços públicos",
    texto: "Use lixeiras disponíveis e ajude a manter praças, praias e ruas limpas.",
  },
  {
    titulo: "Respeite a fauna e a flora local",
    texto: "Observe animais e plantas sem tocar, retirar ou alimentar espécies silvestres.",
  },
  {
    titulo: "Prefira produtos de limpeza concentrados",
    texto: "Quando disponíveis, use produtos concentrados conforme a diluição indicada no rótulo.",
  },
  {
    titulo: "Evite deixar a torneira aberta ao lavar frutas",
    texto: "Lave os alimentos em uma bacia limpa e use a água com cuidado, conforme necessário.",
  },
  {
    titulo: "Mantenha a geladeira bem organizada",
    texto: "Guarde cada alimento no local recomendado e evite deixar a porta aberta por muito tempo.",
  },
  {
    titulo: "Prefira eletrodomésticos eficientes",
    texto: "Na hora de substituir um aparelho, compare o consumo informado na etiqueta de eficiência energética.",
  },
  {
    titulo: "Aproveite a água da chuva com segurança",
    texto: "Se for captar água, use recipientes cobertos e siga orientações locais; não a consuma sem tratamento adequado.",
  },
  {
    titulo: "Plante espécies nativas",
    texto: "Consulte especialistas ou viveiros locais para escolher espécies adequadas ao espaço e à região.",
  },
  {
    titulo: "Evite espécies invasoras no jardim",
    texto: "Antes de plantar, confirme se a espécie é apropriada para a região e não ameaça a biodiversidade local.",
  },
  {
    titulo: "Faça uma horta com o que consome",
    texto: "Cultive ervas ou hortaliças compatíveis com seu espaço e use água de forma responsável.",
  },
  {
    titulo: "Participe de ações ambientais locais",
    texto: "Procure mutirões, hortas comunitárias ou iniciativas de educação ambiental na sua região.",
  },
  {
    titulo: "Prefira comprar produtos duráveis",
    texto: "Antes de comprar, avalie se o item pode ser reparado, reutilizado e se atende a uma necessidade real.",
  },
  {
    titulo: "Evite compras por impulso",
    texto: "Espere um pouco antes de comprar algo não planejado e avalie se você realmente precisa do item.",
  },
  {
    titulo: "Escolha embalagens retornáveis",
    texto: "Quando houver um sistema de retorno disponível, devolva a embalagem conforme as instruções do estabelecimento.",
  },
  {
    titulo: "Recicle corretamente o vidro",
    texto: "Embale cacos com segurança e siga as orientações do serviço local de coleta para evitar acidentes.",
  },
  {
    titulo: "Não misture recicláveis com lixo orgânico",
    texto: "Separar os materiais desde o início ajuda a reduzir a contaminação dos recicláveis.",
  },
  {
    titulo: "Use filtros reutilizáveis quando adequados",
    texto: "Em cafeteiras compatíveis, um filtro lavável pode substituir filtros descartáveis.",
  },
  {
    titulo: "Cuide bem dos seus equipamentos",
    texto: "Limpeza e uso conforme as instruções ajudam a prolongar a vida útil de aparelhos e ferramentas.",
  },
  {

    titulo: "Escolha o tamanho certo da embalagem",
    texto: "Compre quantidades que consiga consumir antes do vencimento para evitar sobras e desperdício.",
  },
  {
    titulo: "Confira a validade antes de comprar",
    texto: "Verifique se terá tempo de consumir o produto dentro do prazo indicado na embalagem.",
  },
  {
    titulo: "Transforme sobras em novas refeições",
    texto: "Use a criatividade para reaproveitar sobras armazenadas corretamente e ainda próprias para consumo.",
  },
  {
    titulo: "Use a lava-louças somente com carga completa",
    texto: "Se você usa lava-louças, aguarde uma carga adequada e siga as orientações de economia do aparelho.",
  },
  {
    titulo: "Lave e reutilize suas sacolas",
    texto: "Mantenha sacolas reutilizáveis limpas e em bom estado para usá-las por mais tempo.",
  },
  {
    titulo: "Encaminhe tecidos sem condição de uso à coleta",
    texto: "Procure iniciativas locais que recebam tecidos desgastados para reaproveitamento ou reciclagem.",
  },
  {
    titulo: "Consulte o calendário da coleta seletiva",
    texto: "Confira os dias e horários da coleta no seu bairro para deixar os recicláveis no momento adequado.",
  },
  {
    titulo: "Reaproveite água enquanto espera o chuveiro aquecer",
    texto: "Se conseguir coletá-la de forma limpa, use essa água em tarefas como limpeza ou rega.",
  },
  {
    titulo: "Prefira recipientes duráveis para armazenar alimentos",
    texto: "Potes reutilizáveis ajudam a conservar alimentos e podem substituir embalagens descartáveis.",
  },
  {
    titulo: "Evite descartar resíduos em bueiros",
    texto: "Jogue o lixo em uma lixeira: resíduos levados pela chuva podem chegar a rios e áreas naturais.",
  },
];

function obterDicaDoDia(data = new Date()) {
  const diaLocal = Date.UTC(
    data.getFullYear(),
    data.getMonth(),
    data.getDate()
  ) / 86400000;
  const indice = Math.floor(diaLocal) % dicasSustentaveis.length;

  return {
    dica: dicasSustentaveis[indice],
    numero: indice + 1,
  };
}


function ProgressRing({ size, strokeWidth, progress, color, children }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#262626"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </Svg>
      {children}
    </View>
  );
}

export default function Home({ setScreen }) {
  const [busca, setBusca] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [dataDica, setDataDica] = useState(() => new Date());
  const { dica, numero: numeroDica } = obterDicaDoDia(dataDica);

  useEffect(() => {
    const agora = new Date();
    const amanha = new Date(
      agora.getFullYear(),
      agora.getMonth(),
      agora.getDate() + 1
    );
    const temporizador = setTimeout(
      () => setDataDica(new Date()),
      amanha.getTime() - agora.getTime()
    );

    return () => clearTimeout(temporizador);
  }, [dataDica]);

  const menuItems = [
    { label: "Início", screen: "Home", icon: "home-outline" },
    { label: "Infos", screen: "Infos", icon: "newspaper-outline" },
    { label: "Desafios", screen: "Desafios", icon: "trophy-outline" },
    { label: "Relato", screen: "CriarRelato", icon: "create-outline" },
    { label: "Perfil", screen: "MeuPerfil", icon: "person-outline" },
  ];

  return (
    <View style={styles.pageWrap}>
      {menuOpen && (
        <Pressable style={styles.menuOverlay} onPress={() => setMenuOpen(false)}>
          <View style={styles.menuSheet}>
            {menuItems.map((item) => (
              <Pressable
                key={item.label}
                style={styles.menuItem}
                onPress={() => {
                  setMenuOpen(false);
                  setScreen(item.screen);
                }}
              >
                <Ionicons name={item.icon} size={18} color="#22c55e" />
                <Text style={styles.menuItemText}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      )}

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="leaf" size={22} color="#22c55e" style={{ marginRight: 6 }} />
          <Text style={styles.logoText}>
            Eco<Text style={{ color: "#22c55e" }}>Track</Text>
          </Text>
        </View>
        <Pressable onPress={() => setMenuOpen((prev) => !prev)} hitSlop={12} style={styles.menuButton}>
          <Ionicons name="menu" size={26} color="#22c55e" />
        </Pressable>
      </View>

      {/* Saudação */}
      <View style={styles.section}>
        <Text style={styles.greeting}>
          Olá, <Text style={{ color: "#22c55e" }}>Usuário</Text>!
        </Text>
        <Text style={styles.subGreeting}>
          Que tal transformar hoje em um dia{" "}
          <Text style={{ color: "#22c55e" }}>mais sustentável</Text>?
        </Text>
      </View>

      {/* EcoScore */}
      <View style={[styles.card, styles.ecoScoreCard]}>
        <View style={styles.ecoScoreHeader}>
          <Text style={styles.cardTitleSmall}>Seu EcoScore</Text>
          <Ionicons name="information-circle-outline" size={16} color="#8a8a8a" />
        </View>

        <View style={styles.ecoScoreBody}>
          <ProgressRing size={100} strokeWidth={10} progress={75} color="#22c55e">
            <Text style={styles.ecoScoreNumber}>750</Text>
            <Text style={styles.ecoScoreOf}>de 1000</Text>
          </ProgressRing>

          <View style={{ flex: 1, marginLeft: 18 }}>
            <Text style={styles.ecoScoreGood}>Muito bem!</Text>
            <Text style={styles.ecoScoreText}>
              Você está no caminho certo para uma cidade mais sustentável.
            </Text>

            <Pressable style={styles.outlineButton}>
              <Ionicons name="trending-up" size={16} color="#e5e5e5" style={{ marginRight: 6 }} />
              <Text style={styles.outlineButtonText}>Ver meu impacto</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Seu impacto */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Seu impacto</Text>

        <View style={styles.rowThree}>
          <View style={styles.statCard}>
            <View style={styles.statIconCircle}>
              <Ionicons name="leaf-outline" size={20} color="#22c55e" />
            </View>
            <Text style={styles.statNumber}>12,4 kg</Text>
            <Text style={styles.statLabel}>CO² evitado</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconCircle}>
              <Ionicons name="refresh-outline" size={20} color="#22c55e" />
            </View>
            <Text style={styles.statNumber}>23</Text>
            <Text style={styles.statLabel}>Materiais reciclados</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconCircle}>
              <Ionicons name="construct-outline" size={20} color="#22c55e" />
            </View>
            <Text style={styles.statNumber}>10</Text>
            <Text style={styles.statLabel}>Danos estruturais consertados</Text>
          </View>
        </View>
      </View>

      {/* Ações rápidas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ações rápidas</Text>

        <View style={styles.rowThree}>
          <Pressable style={styles.actionCard} onPress={() => setScreen("RegistrarReciclagem")}>
            <View style={styles.statIconCircle}>
              <Ionicons name="refresh-outline" size={20} color="#22c55e" />
            </View>
            <Text style={styles.actionTitle}>Registrar</Text>
            <Text style={styles.actionLabel}>reciclagem</Text>
          </Pressable>

          <Pressable style={styles.actionCard} onPress={() => setScreen("Desafios")}>
            <View style={styles.statIconCircle}>
              <Ionicons name="trophy-outline" size={20} color="#22c55e" />
            </View>
            <Text style={styles.actionTitle}>Desafios</Text>
            <Text style={styles.actionLabel}>sustentáveis</Text>
          </Pressable>

          <Pressable style={styles.actionCard} onPress={() => setScreen("CriarRelato")}>
            <View style={styles.statIconCircle}>
              <Ionicons name="time-outline" size={20} color="#22c55e" />
            </View>
            <Text style={styles.actionTitle}>Reportar</Text>
            <Text style={styles.actionLabel}>relato</Text>
          </Pressable>
        </View>
      </View>

      {/* Desafios para você */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Desafios para você</Text>
          <Pressable
            style={{ flexDirection: "row", alignItems: "center" }}
            onPress={() => setScreen("Desafios")}
            accessibilityRole="button"
            accessibilityLabel="Ver todos os desafios"
          >
            <Text style={styles.verTodos}>Ver todos</Text>
            <Ionicons name="chevron-forward" size={14} color="#8a8a8a" />
          </Pressable>
        </View>

        <View style={[styles.card, styles.desafioCard]}>
          <ProgressRing size={64} strokeWidth={6} progress={42} color="#22c55e">
            <Text style={styles.desafioPercent}>42%</Text>
          </ProgressRing>

          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.desafioTitle}>Desafio Sem Plástico</Text>
            <Text style={styles.desafioText}>
              Evite o uso de plástico descartável por 7 dias.
            </Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: "42%" }]} />
            </View>
            <Text style={styles.desafioDias}>3 de 7 dias</Text>
          </View>

          <View style={styles.giftBox}>
            <Ionicons name="gift-outline" size={22} color="#22c55e" />
          </View>
        </View>
      </View>

      {/* Mapa */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mapa de relatos</Text>

        <View style={styles.searchRow}>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="search" size={18} color="#22c55e" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar no mapa"
              placeholderTextColor="#8a8a8a"
              value={busca}
              onChangeText={setBusca}
            />
          </View>
          <Pressable style={styles.filterButton}>
            <Ionicons name="funnel-outline" size={18} color="#e5e5e5" />
          </Pressable>
        </View>

        {/* Mockup visual do mapa - trocar por MapView real depois */}
        <View style={styles.mapMock}>
          <View style={styles.mapZoomControls}>
            <View style={styles.mapZoomBtn}>
              <Ionicons name="add" size={16} color="#e5e5e5" />
            </View>
            <View style={styles.mapZoomBtn}>
              <Ionicons name="remove" size={16} color="#e5e5e5" />
            </View>
          </View>
          
          <MapPin label="Categoria: lixo" color="#ef4444" style={{ top: 14, right: 30 }} />
          <MapPin label="Categoria: esgoto" color="#22c55e" style={{ top: 70, left: 10 }} />
          <MapPin label="Categoria: infraestrutura" color="#222dc5" style={{ top: 130, left: 60 }} />
          <MapPin label="Categoria: água" color="#22c55e" style={{ top: 165, left: 190 }} />
        </View>
      </View>
      
      {/* Dica sustentável */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dica sustentável</Text>

        <View style={[styles.card, styles.dicaCard]}>
          <Ionicons name="leaf-outline" size={26} color="#22c55e" />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.dicaTitle}>{dica.titulo}</Text>
            <Text style={styles.dicaText}>{dica.texto}</Text>
          </View>
        </View>

        <Text style={styles.dicaIndicador}>
          Dica {numeroDica} de {dicasSustentaveis.length} · atualizada diariamente
        </Text>
      </View>
    </ScrollView>
    <TabBar active="Home" setScreen={setScreen} />
    </View>
  );
}

function MapPin({ label, color, style }) {
  return (
    <View style={[{ position: "absolute", alignItems: "center" }, style]}>
      <Ionicons name="location" size={26} color={color} />
      {label && (
        <View style={styles.mapPinLabel}>
          <Text style={styles.mapPinLabelText}>{label}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pageWrap: {
    flex: 1,
    backgroundColor: "#0f0f0f",
  },
  container: {
    flex: 1,
    backgroundColor: "#161515",
  },

  header: {
    width: "100%",
    paddingTop: 60,
    paddingBottom: 15,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 25,
  },

  menuButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  menuOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.25)",
    zIndex: 30,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 70,
    paddingRight: 18,
  },

  menuSheet: {
    width: 180,
    backgroundColor: "#161616",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    borderRadius: 14,
    overflow: "hidden",
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#262626",
  },

  menuItemText: {
    color: "#e5e5e5",
    fontSize: 14,
    fontWeight: "600",
  },

  logoText: {
    color: "#e5e5e5",
    fontSize: 18,
    fontWeight: "bold",
  },

  section: {
    paddingHorizontal: 25,
    marginTop: 22,
  },

  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  greeting: {
    color: "#e5e5e5",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 6,
  },

  subGreeting: {
    color: "#a3a3a3",
    fontSize: 14,
    lineHeight: 20,
  },

  sectionTitle: {
    color: "#e5e5e5",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 12,
  },

  verTodos: {
    color: "#8a8a8a",
    fontSize: 13,
    marginRight: 2,
  },

  card: {
    borderWidth: 1,
    borderColor: "#262626",
    backgroundColor: "#161616",
    borderRadius: 16,
    padding: 18,
  },

  ecoScoreCard: {
    marginHorizontal: 25,
    marginTop: 20,
  },

  ecoScoreHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  cardTitleSmall: {
    color: "#a3a3a3",
    fontSize: 13,
    marginRight: 6,
  },

  ecoScoreBody: {
    flexDirection: "row",
    alignItems: "center",
  },

  ecoScoreNumber: {
    color: "#e5e5e5",
    fontSize: 22,
    fontWeight: "bold",
  },

  ecoScoreOf: {
    color: "#8a8a8a",
    fontSize: 11,
  },

  ecoScoreGood: {
    color: "#22c55e",
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 4,
  },

  ecoScoreText: {
    color: "#a3a3a3",
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },

  outlineButton: {
    borderWidth: 1,
    borderColor: "#3a3a3a",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },

  outlineButtonText: {
    color: "#e5e5e5",
    fontSize: 12,
    fontWeight: "bold",
  },

  rowThree: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#262626",
    backgroundColor: "#161616",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: "center",
    marginRight: 10,
  },

  actionCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#262626",
    backgroundColor: "#161616",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 6,
    alignItems: "center",
    marginRight: 10,
  },

  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  statNumber: {
    color: "#e5e5e5",
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 2,
  },

  statLabel: {
    color: "#8a8a8a",
    fontSize: 10,
    textAlign: "center",
  },

  actionTitle: {
    color: "#e5e5e5",
    fontWeight: "bold",
    fontSize: 13,
  },

  actionLabel: {
    color: "#8a8a8a",
    fontSize: 10,
  },

  desafioCard: {
    flexDirection: "row",
    alignItems: "center",
  },

  desafioPercent: {
    color: "#e5e5e5",
    fontWeight: "bold",
    fontSize: 14,
  },

  desafioTitle: {
    color: "#e5e5e5",
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 4,
  },

  desafioText: {
    color: "#a3a3a3",
    fontSize: 11,
    marginBottom: 8,
  },

  progressBarBg: {
    height: 5,
    backgroundColor: "#262626",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 4,
  },

  progressBarFill: {
    height: "100%",
    backgroundColor: "#22c55e",
  },

  desafioDias: {
    color: "#8a8a8a",
    fontSize: 10,
  },

  giftBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  searchRow: {
    flexDirection: "row",
    marginBottom: 14,
  },

  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3a3a3a",
    backgroundColor: "#161616",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: "#e5e5e5",
  },

  filterButton: {
    width: 46,
    borderWidth: 1,
    borderColor: "#3a3a3a",
    backgroundColor: "#161616",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  mapMock: {
    height: 220,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#262626",
    backgroundColor: "#141b16",
    overflow: "hidden",
  },

  mapZoomControls: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 2,
  },

  mapZoomBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: "#1f1f1f",
    borderWidth: 1,
    borderColor: "#3a3a3a",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },

  mapPinLabel: {
    backgroundColor: "#1f1f1f",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 2,
  },

  mapPinLabelText: {
    color: "#e5e5e5",
    fontSize: 8,
  },

  dicaCard: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  dicaTitle: {
    color: "#e5e5e5",
    fontWeight: "bold",
    fontSize: 13,
    marginBottom: 4,
  },

  dicaText: {
    color: "#a3a3a3",
    fontSize: 12,
    lineHeight: 17,
  },

  dicaIndicador: {
    color: "#737373",
    fontSize: 11,
    textAlign: "right",
    marginTop: 10,
  },
});