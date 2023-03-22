const messages = {
  fee_tip: '無費用，成為節點，贏 PSN！ ',
  contribution_value: '交易貢獻值',
  coming_soon: '敬請期待',
  volume: '交易量',
  out_of_range: '超出範圍',
  liquidity: '流動性',
  pool_overview: '流動性池',
  pool_overview_2: '流動性池',
  balance_on_everpay: 'everPay 上的餘額',
  collect_nft: '收藏 NFT',
  pls_paste_pk: '請輸入或粘貼私鑰',
  buy_nfts: '購買 NFTs  ↗︎',
  pk_notice: '私鑰為長度64位的 a-f, 0-9 字符串',
  max_price: '最高兌換率',
  select_pair: '選擇交易對',
  my_pool: '我的倉位',
  out_price_range: '市場兌換率超出您指定的範圍。 ',
  hold_nft_register_1: '持有認證 NFT，成為 LP 節點。 ',
  hold_nft_register: '持有認證 NFT, 運行 LP 節點，獲取更多獎勵！ ',
  think_again: '再想想',
  deposit_amounts: '充值數額',
  registration_node: '添加錢包',
  close_lp_node: '關閉倉位',
  deposit: '充值',
  deposit_2: '充值  ↗︎',
  disconnect_notice: '請謹慎操作：斷開後，所有流動性池將自動關閉！ ',
  close_lp_notice: '關閉該倉位，您的獎勵可能會收到影響。另外，您將無法在列表中找到它，除非您可以再次新增該倉位。 ',
  max: '最大',
  add_liquidity: '增加流動性',
  new_position: '新倉位',
  disconnect: '斷開',
  import: '導入',
  importing: '導入中',
  import_success: '導入成功',
  import_pk: '導入私鑰',
  import_keyfile: '導入 Keyfile',
  jwk_notice: '不符合 JWK File 格式',
  close_anyway: '仍關閉',
  invalid_range_selected: '選擇的範圍無效。最小兌換率必須低於最大兌換率',
  invalid_out_range: '您的倉位在市場兌換率變化進入到您設置的範圍內之前不被用於進行兌換交易。 ',
  in_range: '在範圍內',
  enter_amount: '輸入數額',
  sign_up: '添加錢包',
  min_price: '最低兌換率',
  your_at_liq_appr: '您的活躍中的流動性倉位在此展示。 ',
  current_price: '當前價格',
  full_range: '全範圍',
  import_warn_1: '我們不會保存你的私鑰，請在安全的環境下導入私鑰！ ',
  import_warn_2: '同一賬戶地址僅支持一種角色，即成為 Lp 節點，將不能在 DApp 中交易。 ',
  import_notice: '導入賬戶是您使用私鑰字符串或私鑰 JSON 文件導入的賬戶，且並非使用與您的錢包和賬戶相同的助記詞所創建。您必須妥善單獨保存用於訪問導入賬戶的信息，確保將來能夠恢復這些賬戶。 ',
  select_format: '選擇格式',
  whitepaper: '白皮書',
  per: '每',
  copy: '複製',
  replicated: '已復制！ ',
  cancel: '取消',
  name: '名稱',
  clear_all: '清空全部',
  set_price_range: '設置兌換率範圍',
  become_lp: '確認添加',
  preview: '預覽',
  insufficient_$symbol: '{symbol} 餘額不足',
  back_to_overview: '返回流動性概覽',
  selected_range: '兌換率範圍',
  price_reached_$symbol: '當達到此兌換率時，您的倉位流動資金將 100% 由 {symbol} 代幣所組成。 ',
  add_successful: '添加成功！ ',
  close_lp_successful: 'LP Node 關閉！ ',
  need_nft: '需持有NFT才能註冊',
  duplicate_pool: '該流動性池已存在，是否替換該池的原數額？',
  normal_connect: '與 Router 正常連接。 ',
  connecting: '連接中...',
  download: '去下載',
  download_tip: '請下載最新版本的客戶端，否則客戶端將無法正常運行。 ',
  balance_not_enough: '餘額不足',
  version_update: '版本更新',
  download_now: '立即下載',
  download_later: '稍後下載',
  no_update: '沒有更新',
  closed_title: '系統維護中…',
  closed_tip: '工程師們在奮力維護。不要著急，我們很快回來！',
  deposit_tip: '前往 everPay ，將資產從其他鏈（如 Arweave，Ethereum，Moonbeam 等）充值至 everPay 上。',
  trade_overview: {
    trading: '極限測試',
    trading_tip: '僅統計活動期間的交易數據。每 1 分鐘更新一次。 ',
    countdown: '倒計時：',
    total_rewards: '總獎勵',
    total_rewards_tip: '週期內總獎勵量',
    total_volume: '總交易量',
    total_volume_tip: '指定代幣對應交易對的交易量。 ',
    my_volume: '我的交易量',
    my_volume_tip: '指定代幣的對應交易對的交易量。 ',
    my_volume_share: '交易量佔比',
    my_volume_share_tip: '我的交易量佔比 = 日交易量佔比之和 / 活動天數 *100%。每 1 分鐘更新一次。僅為預估值，準確數據以最終結算為準。 ',
    my_est_rewards: '我的預估獎勵',
    my_est_rewards_tip: '我的預估總獎勵= 總獎勵 x 我的交易量佔比；僅為預估值，準確數據以最終結算為準；',
    address: '地址',
    est_rewards: '預估獎勵',
    tutorial: '教程  ↗︎',
    no_data: '暫無數據'
  },
  dashboard: {
    dashboard: '數據看板',
    total_volume: '總交易量',
    total_volume_tip: '年度所有交易對的交易量',
    my_volume: '我的交易量',
    my_volume_tip: '年度我的所有的交易量',
    my_earnings: '我的收益',
    my_earnings_tip_1: '年度收益。 ',
    my_earnings_tip_2: '收益在交易完成時即已實時發放到您的賬戶地址中。'
  },
  full_range_tip_title: '效率對比',
  full_range_tip_detail: '全範圍倉位可能比集中倉位賺取更少的交易貢獻值。 ',
  full_range_tip_btn: '我已知曉',
  fee: '收益',
  fees: '收益',
  fees_tip_1: '累计收益。',
  fees_tip_2: '收益在交易完成时即已实时发放到您的账户地址中。',
  warning: '警告',
  confirm: '確認',
  penalty_rule_1: '該賬戶下，您的違規行為導致了 3 筆訂單交易失敗，Router 已斷開您的所有的做市倉位。',
  penalty_rule_2: '直到',
  penalty_rule_3: '以後，您才能繼續使用該賬戶做市。'
}

export default messages
