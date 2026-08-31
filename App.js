import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync().catch(() => {});

const STORAGE_KEY = '@carteira-demo/settings-v1';
const DEFAULTS = { name: 'Franciele', balance: 4280.75 };

const money = (value) =>
  Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

function CircleButton({ emoji, label, onPress, delay = 0 }) {
  const scale = useRef(new Animated.Value(0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 320,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        delay,
        friction: 7,
        tension: 70,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacity, scale]);

  return (
    <Animated.View style={[styles.actionWrap, { opacity, transform: [{ scale }] }]}>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        onPressIn={() => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
        style={styles.actionCircle}
      >
        <Text style={styles.actionEmoji}>{emoji}</Text>
      </Pressable>
      <Text numberOfLines={2} style={styles.actionLabel}>{label}</Text>
    </Animated.View>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [name, setName] = useState(DEFAULTS.name);
  const [balance, setBalance] = useState(DEFAULTS.balance);
  const [balanceVisible, setBalanceVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [secretTaps, setSecretTaps] = useState(0);
  const [draftName, setDraftName] = useState(DEFAULTS.name);
  const [draftBalance, setDraftBalance] = useState(String(DEFAULTS.balance).replace('.', ','));
  const headerY = useRef(new Animated.Value(-20)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          if (typeof saved.name === 'string') setName(saved.name);
          if (typeof saved.balance === 'number') setBalance(saved.balance);
        }
      } catch {}
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    setDraftName(name);
    setDraftBalance(String(balance.toFixed(2)).replace('.', ','));
    Animated.parallel([
      Animated.timing(headerY, {
        toValue: 0,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start();
    SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  const firstName = useMemo(() => (name.trim().split(/\s+/)[0] || 'Visitante'), [name]);

  const saveSettings = async () => {
    const normalized = draftBalance.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
    const parsed = Number(normalized);
    const nextName = draftName.trim().slice(0, 28) || DEFAULTS.name;
    const nextBalance = Number.isFinite(parsed) ? Math.max(-9999999, Math.min(parsed, 9999999)) : balance;
    setName(nextName);
    setBalance(nextBalance);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ name: nextName, balance: nextBalance }));
    setSettingsOpen(false);
  };

  const resetSettings = async () => {
    setName(DEFAULTS.name);
    setBalance(DEFAULTS.balance);
    setDraftName(DEFAULTS.name);
    setDraftBalance(String(DEFAULTS.balance).replace('.', ','));
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  const tapDemo = () => {
    const next = secretTaps + 1;
    if (next >= 5) {
      setSecretTaps(0);
      setDraftName(name);
      setDraftBalance(String(balance.toFixed(2)).replace('.', ','));
      setSettingsOpen(true);
    } else {
      setSecretTaps(next);
      setTimeout(() => setSecretTaps(0), 1600);
    }
  };

  if (!ready) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#E91E63" />
      <View style={styles.root}>
        <Animated.View style={[styles.header, { opacity: headerOpacity, transform: [{ translateY: headerY }] }]}>
          <View style={styles.topRow}>
            <View style={styles.avatar}><Text style={styles.avatarText}>◎</Text></View>
            <Pressable onPress={tapDemo} style={styles.demoBadge}>
              <Text style={styles.demoBadgeText}>SIMULAÇÃO</Text>
            </Pressable>
            <View style={styles.headerIcons}>
              <Pressable onPress={() => setBalanceVisible(v => !v)} style={styles.headerIcon}>
                <Text style={styles.headerIconText}>{balanceVisible ? '◉' : '◌'}</Text>
              </Pressable>
              <Pressable onPress={() => setInfoOpen(true)} style={styles.headerIcon}>
                <Text style={styles.headerIconText}>?</Text>
              </Pressable>
            </View>
          </View>
          <Text style={styles.hello}>Olá, {firstName}</Text>
          <Text style={styles.watermark}>DEMO • SEM VALOR REAL</Text>
        </Animated.View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.accountRow}>
            <View>
              <Text style={styles.sectionTitle}>Conta demonstrativa</Text>
              <Text style={styles.balance}>
                {balanceVisible ? money(balance) : '••••••'}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actions}>
            <CircleButton emoji="◇" label="Área Pix" onPress={() => setInfoOpen(true)} delay={50} />
            <CircleButton emoji="▥" label="Pagar" onPress={() => setInfoOpen(true)} delay={100} />
            <CircleButton emoji="◎" label="Empréstimo demo" onPress={() => setInfoOpen(true)} delay={150} />
            <CircleButton emoji="⇧" label="Transferir" onPress={() => setInfoOpen(true)} delay={200} />
            <CircleButton emoji="＋" label="Mais" onPress={() => setInfoOpen(true)} delay={250} />
          </ScrollView>

          <Pressable style={styles.cardButton} onPress={() => setInfoOpen(true)}>
            <Text style={styles.cardIcon}>▯</Text>
            <Text style={styles.cardButtonText}>Meus cartões fictícios</Text>
          </Pressable>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsRow}>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardText}>
                Você tem até <Text style={styles.bold}>{balanceVisible ? money(Math.max(balance * 0.35, 0)) : '••••'}</Text> em limite simulado.
              </Text>
              <Text style={styles.micro}>Nenhuma operação financeira é realizada.</Text>
            </View>
            <View style={styles.infoCardSmall}>
              <Text style={styles.infoCardText}>Salve seus favoritos de demonstração.</Text>
            </View>
          </ScrollView>

          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>Aplicativo de demonstração</Text>
            <Text style={styles.noticeText}>
              Este projeto não se conecta a banco, não movimenta dinheiro e não representa saldo real.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <Text style={styles.bottomActive}>↕</Text>
          <Text style={styles.bottomItem}>$</Text>
          <Text style={styles.bottomItem}>▢</Text>
        </View>
      </View>

      <Modal visible={settingsOpen} transparent animationType="fade" onRequestClose={() => setSettingsOpen(false)}>
        <KeyboardAvoidingView style={styles.modalBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Configuração da simulação</Text>
            <Text style={styles.modalHint}>Esses dados são apenas visuais e continuam marcados como DEMO.</Text>

            <Text style={styles.inputLabel}>Nome exibido</Text>
            <TextInput
              value={draftName}
              onChangeText={setDraftName}
              maxLength={28}
              style={styles.input}
              placeholder="Nome"
            />

            <Text style={styles.inputLabel}>Saldo fictício (R$)</Text>
            <TextInput
              value={draftBalance}
              onChangeText={setDraftBalance}
              keyboardType="decimal-pad"
              style={styles.input}
              placeholder="0,00"
            />

            <View style={styles.modalActions}>
              <Pressable onPress={resetSettings} style={styles.secondaryButton}>
                <Text style={styles.secondaryText}>Restaurar</Text>
              </Pressable>
              <Pressable onPress={saveSettings} style={styles.primaryButton}>
                <Text style={styles.primaryText}>Salvar</Text>
              </Pressable>
            </View>
            <Pressable onPress={() => setSettingsOpen(false)} style={styles.closeLink}>
              <Text style={styles.closeText}>Cancelar</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={infoOpen} transparent animationType="slide" onRequestClose={() => setInfoOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.modalTitle}>Recurso demonstrativo</Text>
            <Text style={styles.modalHint}>
              Este botão é interativo, mas não executa Pix, pagamentos, transferências, empréstimos nem qualquer operação financeira.
            </Text>
            <Pressable onPress={() => setInfoOpen(false)} style={styles.primaryButtonFull}>
              <Text style={styles.primaryText}>Entendi</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E91E63' },
  root: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 18 : 8,
    paddingBottom: 26,
  },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: '#F33F78',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: 'white', fontSize: 28, fontWeight: '700' },
  demoBadge: {
    marginLeft: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,.65)',
    borderRadius: 99, paddingHorizontal: 10, paddingVertical: 6,
  },
  demoBadgeText: { color: 'white', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  headerIcons: { marginLeft: 'auto', flexDirection: 'row', gap: 12 },
  headerIcon: {
    width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
  },
  headerIconText: { color: 'white', fontSize: 25, fontWeight: '600' },
  hello: { color: 'white', fontSize: 22, fontWeight: '700', marginTop: 30 },
  watermark: { color: 'rgba(255,255,255,.8)', fontSize: 10, fontWeight: '800', letterSpacing: 1.4, marginTop: 7 },
  content: { paddingBottom: 120 },
  accountRow: { padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#111' },
  balance: { fontSize: 20, fontWeight: '700', marginTop: 14, color: '#111' },
  chevron: { fontSize: 38, color: '#777' },
  actions: { paddingHorizontal: 18, paddingBottom: 24, gap: 8 },
  actionWrap: { width: 96, alignItems: 'center' },
  actionCircle: {
    width: 74, height: 74, borderRadius: 37, backgroundColor: '#FCE7EE',
    alignItems: 'center', justifyContent: 'center',
  },
  actionEmoji: { fontSize: 28, color: '#111' },
  actionLabel: { marginTop: 10, textAlign: 'center', fontSize: 15, lineHeight: 19, color: '#171717' },
  cardButton: {
    marginHorizontal: 24, minHeight: 64, borderRadius: 16, backgroundColor: '#FCE7EE',
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 16,
  },
  cardIcon: { fontSize: 28 },
  cardButtonText: { fontSize: 17, fontWeight: '700' },
  cardsRow: { paddingHorizontal: 24, paddingVertical: 24, gap: 14 },
  infoCard: {
    width: Math.min(width * 0.72, 330), minHeight: 132, borderRadius: 18,
    backgroundColor: '#FCE7EE', padding: 20, justifyContent: 'center',
  },
  infoCardSmall: {
    width: Math.min(width * 0.52, 240), minHeight: 132, borderRadius: 18,
    backgroundColor: '#FCE7EE', padding: 20, justifyContent: 'center',
  },
  infoCardText: { fontSize: 17, lineHeight: 24, color: '#222' },
  micro: { marginTop: 10, fontSize: 11, lineHeight: 16, color: '#777' },
  bold: { fontWeight: '800' },
  notice: { marginHorizontal: 24, padding: 18, borderRadius: 16, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#ECECEC' },
  noticeTitle: { fontWeight: '800', fontSize: 16, marginBottom: 6 },
  noticeText: { color: '#666', lineHeight: 20 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 74, backgroundColor: '#FFF',
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#DDD', flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-around',
  },
  bottomActive: { color: '#E91E63', fontSize: 31, fontWeight: '700' },
  bottomItem: { color: '#777', fontSize: 28 },
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,.35)', justifyContent: 'center', padding: 20,
  },
  modalCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 22 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#111' },
  modalHint: { fontSize: 14, lineHeight: 20, color: '#666', marginTop: 8, marginBottom: 18 },
  inputLabel: { fontSize: 13, fontWeight: '700', marginBottom: 7, marginTop: 10, color: '#444' },
  input: {
    borderWidth: 1, borderColor: '#DDD', borderRadius: 12, paddingHorizontal: 14,
    height: 50, fontSize: 16, backgroundColor: '#FAFAFA',
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 22 },
  primaryButton: { flex: 1, backgroundColor: '#E91E63', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  secondaryButton: { flex: 1, backgroundColor: '#F3F3F3', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  primaryText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  secondaryText: { color: '#333', fontWeight: '800', fontSize: 15 },
  closeLink: { paddingTop: 16, alignItems: 'center' },
  closeText: { color: '#666', fontWeight: '700' },
  sheet: {
    marginTop: 'auto', backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 36,
  },
  sheetHandle: { width: 44, height: 5, borderRadius: 10, backgroundColor: '#DDD', alignSelf: 'center', marginBottom: 22 },
  primaryButtonFull: { backgroundColor: '#E91E63', borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
});
