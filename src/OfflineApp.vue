<script setup>
import { ref, computed, onMounted } from 'vue';
const api = window.voccy;
const page = ref('new'), question = ref(''), answer = ref(''), keyword = ref('');
const cards = ref([]), settings = ref({}), quiz = ref([]), current = ref(0), revealed = ref(false);
const editing = ref(null), busy = ref(false), error = ref(''), message = ref('');
const active = computed(() => quiz.value[current.value]);
const filtered = computed(() => cards.value.filter(c => `${c.question || ''}\n${c.answer || ''}`.toLowerCase().includes(keyword.value.toLowerCase())));
const labels = { cross: '×', circle: '○', check: '✓', done: '習得済み' };
async function act(fn) {
  if (busy.value) return;
  busy.value = true; error.value = ''; message.value = '';
  try { await fn(); } catch (e) { error.value = e.message; }
  finally { busy.value = false; }
}
async function load() { const data = await api.list(); cards.value = data.flashcards; settings.value = data.settings; }
function navigate(value) {
  act(async () => {
    if (value === 'review') { quiz.value = await api.quiz(); current.value = 0; revealed.value = false; }
    if (value === 'settings') await load();
    editing.value = null; page.value = value;
  });
}
function save() { act(async () => { await api.add({ question: question.value, answer: answer.value }); question.value = ''; answer.value = ''; message.value = '保存しました'; }); }
function review(result) {
  act(async () => {
    const c = active.value;
    await api.review({ id: c.id, result, expected_previous: c.previous_result, expected_latest: c.latest_result, expected_timestamp: c.latest_test_timestamp });
    current.value++; revealed.value = false;
  });
}
function edit() { act(async () => { await api.edit({ ...editing.value }); editing.value = null; await load(); message.value = '保存しました'; }); }
function remove(c) {
  if (window.confirm(`「${c.question}」を削除しますか？`)) act(async () => { await api.remove({ id: c.id }); await load(); message.value = '削除しました'; });
}
function saveSettings() { act(async () => { settings.value = await api.changeSettings({ ...settings.value }); message.value = '設定を保存しました'; }); }
onMounted(() => act(load));
</script>
<template>
  <header><strong>Voccy</strong><nav aria-label="画面切り替え">
    <button :disabled="busy" @click="navigate('new')">単語登録</button>
    <button :disabled="busy" @click="navigate('review')">復習</button>
    <button :disabled="busy" @click="navigate('settings')">単語一覧・設定</button>
  </nav><span>オフライン</span></header>
  <main>
    <p v-if="error" role="alert" class="error">{{ error }}</p><p v-if="message" role="status" class="success">{{ message }}</p>
    <section v-if="page === 'new'" class="panel narrow">
      <h1>単語を登録</h1><form @submit.prevent="save">
        <label for="question">単語・質問</label><textarea id="question" v-model="question" required maxlength="100000" rows="3"></textarea>
        <label for="answer">意味・回答</label><textarea id="answer" v-model="answer" required maxlength="100000" rows="8"></textarea>
        <button class="primary" :disabled="busy || !question.trim() || !answer.trim()">保存</button>
      </form>
    </section>
    <section v-if="page === 'review'" class="panel narrow">
      <h1>復習</h1><template v-if="active"><p>{{ current + 1 }} / {{ quiz.length }}</p>
        <button class="card" @click="revealed = !revealed"><h2>{{ active.question }}</h2><p v-if="revealed">{{ active.answer }}</p><small v-else>クリックして回答を表示</small></button>
        <div class="actions"><button :disabled="busy || !revealed" @click="review('cross')">× もう一度</button><button :disabled="busy || !revealed" @click="review('circle')">○ 正解</button><button :disabled="busy || !revealed" @click="review('check')">✓ 覚えた</button></div>
      </template><p v-else>今回の復習は完了です。次の予定時刻にまた復習しましょう。</p>
    </section>
    <template v-if="page === 'settings'">
      <section class="panel"><h1>単語一覧 <small>{{ filtered.length }}件</small></h1>
        <label for="search">検索</label><input id="search" v-model="keyword" placeholder="単語・意味を検索">
        <div class="table-wrap"><table><thead><tr><th>単語・質問</th><th>意味・回答</th><th>前回</th><th>今回</th><th>最終学習</th><th>次回予定</th><th>操作</th></tr></thead>
          <tbody><tr v-for="c in filtered" :key="c.id"><td>{{ c.question }}</td><td class="answer">{{ c.answer }}</td><td>{{ labels[c.previous_result] || '—' }}</td><td>{{ labels[c.latest_result] || '—' }}</td><td>{{ c.latest_test_timestamp || '—' }}</td><td>{{ c.scheduled_test_timestamp || '—' }}</td><td><button :disabled="busy" @click="editing = { ...c }">編集</button> <button :disabled="busy" @click="remove(c)">削除</button></td></tr></tbody>
        </table></div><p v-if="!filtered.length">該当する単語はありません</p>
      </section>
      <section v-if="editing" class="panel narrow"><h2>単語を編集</h2><form @submit.prevent="edit">
        <label for="edit-question">単語・質問</label><textarea id="edit-question" v-model="editing.question" required maxlength="100000"></textarea>
        <label for="edit-answer">意味・回答</label><textarea id="edit-answer" v-model="editing.answer" required rows="6" maxlength="100000"></textarea>
        <button class="primary" :disabled="busy">変更を保存</button> <button type="button" :disabled="busy" @click="editing = null">キャンセル</button>
      </form></section>
      <section class="panel narrow"><h2>リマインダー・復習設定</h2><form @submit.prevent="saveSettings">
        <label class="inline"><input v-model="settings.remind_enabled" type="checkbox" :true-value="1" :false-value="0"> リマインダーを有効にする</label>
        <label for="times">通知時刻（PCのローカル時刻）</label><input id="times" v-model="settings.remind_times" required placeholder='["07:00","13:00","19:00"]'>
        <label for="max">1回の復習の最大件数</label><input id="max" v-model.number="settings.max_test_nums" type="number" min="1" max="10000" required>
        <p class="muted">通知はアプリ起動中に届きます。スリープ復帰後は次の通知時刻を再計算します。</p><button class="primary" :disabled="busy">設定を保存</button>
      </form></section>
    </template>
  </main>
</template>
<style>
*{box-sizing:border-box} body{margin:0;font-family:'Segoe UI','Yu Gothic UI',sans-serif;color:#243142;background:#f4f6f8} header{display:flex;align-items:center;gap:30px;padding:15px 30px;background:white;border-bottom:1px solid #d9e1e8}header strong{font-size:24px;color:#157c82}nav{display:flex;gap:8px;flex:1}button{font:inherit;padding:9px 15px;border:1px solid #cbd5df;border-radius:6px;color:inherit;background:white;cursor:pointer}button:hover{background:#edf7f6;border-color:#157c82}button:disabled{opacity:.5;cursor:default}.primary{background:#157c82;color:white;border-color:#157c82}.primary:hover{background:#11666b}header span{color:#157c82;font-size:13px}main{padding:26px;max-width:1500px;margin:auto}.panel{background:white;border:1px solid #dce3e9;border-radius:10px;padding:26px;margin:0 auto 24px}.narrow{max-width:760px}h1{margin:0 0 24px;font-size:25px}h2{font-size:21px}label{display:block;margin:18px 0 8px;font-weight:600}input:not([type=checkbox]),textarea{width:100%;font:inherit;padding:11px;border:1px solid #b9c6d2;border-radius:5px;margin-bottom:14px}textarea{resize:vertical}.inline{display:flex;align-items:center;gap:10px}.error{color:#a32925;background:#ffedeb;padding:14px}.success{color:#166b49;padding:10px}.muted,small{color:#637181;font-size:14px}.card{width:100%;padding:30px;text-align:left;white-space:pre-wrap;overflow-wrap:anywhere}.card p{border-top:1px solid #dce3e9;padding-top:22px}.actions{display:flex;gap:15px;justify-content:center;margin-top:24px}.table-wrap{overflow:auto;max-height:50vh}table{border-collapse:collapse;width:100%;font-size:14px}th,td{text-align:left;padding:12px;border-bottom:1px solid #dce3e9;min-width:75px;vertical-align:top;overflow-wrap:anywhere}th{position:sticky;top:0;background:#edf2f6}td.answer{white-space:pre-wrap;max-width:350px}td:last-child{min-width:150px}
</style>
