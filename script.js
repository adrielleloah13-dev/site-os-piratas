const WHATSAPP_NUMBER = '5571986938928';
// Add only official, confirmed rates here. Keys are neighborhood names in lowercase.
const DELIVERY_FEES_BY_NEIGHBORHOOD = Object.freeze({});
const categories = {
  pasteis: [
    { title: 'Pastéis', items: [
      ['Democrático', 'carne', 13], ['Misto carne', 'carne e queijo', 13], ['Matrix', 'carne, queijo e milho', 13], ['Catú', 'carne e catupiry', 13], ['Alado', 'frango', 13], ['Misto frango', 'frango e queijo', 13], ['Conde', 'frango e catupiry', 13], ['Duque', 'frango e cheddar', 13], ['Triplo X', 'frango, queijo e milho', 13], ['Mineiro', 'queijo mussarela', 13], ['Misto calabresa', 'calabresa ralada e queijo', 13], ['Mafioso', 'calabresa ralada, queijo, tomate e orégano', 13], ['Misto', 'queijo e presunto', 13], ['Napolitano', 'queijo, presunto, tomate e orégano', 13], ['Sertanejo', 'aipim e carne do sol', 13], ['Romeu e Julieta', 'queijo e goiabada · polvilhado com açúcar e canela', 13]
    ]},
    { title: 'Pastéis especiais', items: [
      ['Salpicão', 'frango, queijo, uva passas e bacon', 15], ['Magnífico', 'peito de peru, cheddar e mussarela', 15], ['Trio elétrico', '3 queijos: frescal, mussarela e provolone', 15], ['Supremo', 'atum, catupiry e mussarela', 15], ['Rei', 'camarão', 18], ['Imperador', 'camarão e catupiry', 18], ['Nordestino', 'banana da terra, carne seca e queijo', 16], ['Soberano', 'salmão e catupiry', 18], ['Boliviano', 'carne, queijo, pimenta calabresa, azeitonas e passas', 15], ['Coringa', 'frango, queijo, presunto e milho', 14], ['Praiano', 'queijo coalho, orégano e melaço à parte', 15], ['Almirante', 'carne de fumeiro e queijo coalho', 16]
    ]}
  ],
  porcoes: [{ title: 'Tira-gosto', items: [
    ['Carne do sol com farofa e salada', '', 59], ['Carne do sol c/ batata frita', '', 62], ['Batata frita', 'com queijo ralado', 25], ['Pasteizinhos', '8 unidades', 16], ['Kibes', '8 unidades', 22], ['Bolinhos de bacalhau', '8 unidades', 25], ['Camarão encapotado', '8 unidades', 28], ['Kit de banana real', '5 unidades', 16]
  ]}, { title: 'Porções', items: [
    ['Carne do sol acebolada', '', 40], ['Farofa', '', 8], ['Salada vinagrete', '', 8], ['Pirão de aipim gratinado', '', 28]
  ]}, { title: 'Sopas', items: [
    ['Sopa de carne', 'consulte disponibilidade e valor', null], ['Sopa de frango', 'consulte disponibilidade e valor', null]
  ]}],
  pratos: [{ title: 'Pratos', items: [
    ['Lasanha', 'bolonhesa, frango ou queijo e presunto', 56], ['Pirão de aipim gratinado', 'com carne do sol e salada', 69], ['Escondidinho de camarão', 'com salada', 69]
  ]}],
  panquecas: [{ title: 'Panquecas', items: [
    ['Carne moída com queijo', '', 24], ['Carne moída com catupiry', '', 24], ['Frango em cubos com queijo', '', 24], ['Frango em cubos com catupiry', '', 24]
  ]}],
  sobremesas: [{ title: 'Sobremesas', items: [
    ['Sorvete P', 'escolha o sabor', 8], ['Sorvete G', 'escolha o sabor', 12], ['Milk shake', '400 ml · escolha o sabor', 15], ['Milk shake', '500 ml · escolha o sabor', 17], ['Açaí', '400 ml · escolha os acompanhamentos', 20], ['Açaí', '500 ml · escolha os acompanhamentos', 25]
  ]}],
  bebidas: [{ title: 'Bebidas', items: [
    ['Suco de polpa', '300 ml · escolha o sabor', 6], ['Suco de polpa', '600 ml · escolha o sabor', 12], ['Suco de morango', '300 ml', 8], ['Suco de morango', '600 ml', 15], ['Água mineral', '500 ml', 3.5], ['Água mineral com gás', '500 ml', 5.5], ['H2O / Aquarius Fresh', '', 8], ['Água tônica', '', 7], ['Refrigerante de lata', '', 7], ['Refrigerante de 1 litro', '', 10], ['Cerveja de lata', '', 7], ['Malzbier', '', 8], ['Ice', '', 12], ['Cerveja Heineken', 'long neck', 10], ['Cerveja Heineken', '600 ml', 16], ['Cerveja Amstel', '600 ml', 12], ['Cerveja Devassa', '600 ml', 11], ['Cerveja Itaipava', '600 ml', 10], ['Cerveja Stella Artois', '600 ml', 14], ['Vinho', 'garrafinha', 12], ['Caipiroska', 'limão ou morango', 14], ['Seleta', 'dose', 6]
  ]}]
};

const catalog = new Map();
const order = new Map();
const list = document.querySelector('#menu-list');
const cartItems = document.querySelector('#cart-items');
const money = value => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const deliveryFields = document.querySelector('#delivery-fields');
const neighborhoodInput = document.querySelector('#delivery-neighborhood');
const addressInput = document.querySelector('#delivery-address');
const deliveryQuote = document.querySelector('#delivery-quote');
const deliveryCost = document.querySelector('#delivery-cost');
const orderFeedback = document.querySelector('#order-feedback');
const modeLabels = { local: 'Consumo no local', pickup: 'Retirada no local', delivery: 'Entrega' };

function selectedMode() {
  return document.querySelector('input[name="order-mode"]:checked')?.value || '';
}

function configuredDeliveryFee(neighborhood) {
  const key = neighborhood.trim().toLocaleLowerCase('pt-BR').replace(/\s+/g, ' ');
  if (!key || !Object.hasOwn(DELIVERY_FEES_BY_NEIGHBORHOOD, key)) return null;
  const fee = DELIVERY_FEES_BY_NEIGHBORHOOD[key];
  return Number.isFinite(fee) && fee >= 0 ? fee : null;
}

function selectedProducts() {
  return [...order.entries()].filter(([, quantity]) => quantity > 0)
    .map(([id, quantity]) => ({ ...catalog.get(id), quantity }));
}

function productTotals(items = selectedProducts()) {
  return {
    amount: items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0),
    hasUnpriced: items.some(item => item.price == null)
  };
}

function updateDeliveryFields() {
  const isDelivery = selectedMode() === 'delivery';
  deliveryFields.hidden = !isDelivery;
  neighborhoodInput.required = isDelivery;
  addressInput.required = isDelivery;
  deliveryCost.hidden = true;
  if (!isDelivery) return;

  const fee = configuredDeliveryFee(neighborhoodInput.value);
  const totals = productTotals();
  if (fee == null) {
    deliveryQuote.textContent = 'A taxa de entrega será confirmada pelo estabelecimento no WhatsApp e não está incluída no total dos produtos.';
    return;
  }

  deliveryQuote.textContent = `Taxa de entrega para ${neighborhoodInput.value.trim()}: ${money(fee)}.`;
  const products = selectedProducts();
  if (products.length === 0) return;
  deliveryCost.hidden = false;
  deliveryCost.textContent = totals.hasUnpriced
    ? `Taxa de entrega: ${money(fee)}. Total final a confirmar, pois há produto sem preço informado.`
    : `Taxa de entrega: ${money(fee)} · Total estimado com entrega: ${money(totals.amount + fee)}.`;
}

for (const [category, groups] of Object.entries(categories)) {
  groups.forEach((group, groupIndex) => group.items.forEach(([name, description, price], itemIndex) => {
    const id = `${category}-${groupIndex}-${itemIndex}`;
    catalog.set(id, { id, name, description, price, category });
  }));
}

function quantityControls(id, quantity) {
  if (!quantity) return `<button class="add-button" type="button" data-action="add" data-id="${id}" aria-label="Adicionar ${catalog.get(id).name} ao pedido">Adicionar <span>+</span></button>`;
  return `<div class="quantity-control" aria-label="Quantidade de ${catalog.get(id).name}"><button type="button" data-action="decrease" data-id="${id}" aria-label="Diminuir quantidade">−</button><b>${quantity}</b><button type="button" data-action="increase" data-id="${id}" aria-label="Aumentar quantidade">+</button></div>`;
}

function renderMenu(category) {
  const groups = categories[category];
  list.innerHTML = groups.map((group, groupIndex) => `<section class="menu-category"><h3>${group.title}</h3>${group.items.map(([, , price], itemIndex) => {
    const id = `${category}-${groupIndex}-${itemIndex}`;
    const item = catalog.get(id);
    const details = item.description ? `<span class="item-desc">${item.description}</span>` : '';
    return `<article class="menu-item"><div class="item-copy"><b>${item.name}</b>${details}</div><b class="item-price">${item.price == null ? 'Consultar' : money(item.price)}</b>${quantityControls(id, order.get(id) || 0)}</article>`;
  }).join('')}</section>`).join('');
}

function updateCart() {
  const selected = selectedProducts();
  const count = selected.reduce((sum, item) => sum + item.quantity, 0);
  const { hasUnpriced, amount: total } = productTotals(selected);
  document.querySelector('#cart-count').textContent = count;
  document.querySelector('#cart-total').textContent = hasUnpriced ? (total ? `${money(total)} + valor a confirmar` : 'Valor a confirmar') : money(total);
  document.querySelector('#mobile-count').textContent = `${count} ${count === 1 ? 'item' : 'itens'}`;
  document.querySelector('#mobile-total').textContent = hasUnpriced ? (total ? `${money(total)} + confirmar` : 'Valor a confirmar') : money(total);
  document.querySelector('#mobile-order-bar').hidden = count === 0;

  if (selected.length === 0) {
    cartItems.innerHTML = '<p class="cart-empty">Seu pedido ainda está vazio.<br><span>Adicione seus pastéis favoritos.</span></p>';
  } else {
    cartItems.innerHTML = selected.map(item => `<div class="cart-line"><div><b>${item.quantity}× ${item.name}</b>${item.description ? `<small>${item.description}</small>` : ''}<small>${item.price == null ? 'Valor a confirmar' : money(item.price * item.quantity)}</small></div><div class="quantity-control compact"><button type="button" data-action="decrease" data-id="${item.id}" aria-label="Diminuir ${item.name}">−</button><b>${item.quantity}</b><button type="button" data-action="increase" data-id="${item.id}" aria-label="Aumentar ${item.name}">+</button></div><button type="button" class="remove-item" data-action="remove" data-id="${item.id}" aria-label="Remover ${item.name}">×</button></div>`).join('');
  }
  renderMenu(document.querySelector('.tab.active').dataset.target);
  updateDeliveryFields();
}

function setQuantity(id, change) {
  const next = (order.get(id) || 0) + change;
  if (next <= 0) order.delete(id); else order.set(id, next);
  updateCart();
  orderFeedback.textContent = '';
}

document.querySelectorAll('.tab').forEach(button => button.addEventListener('click', () => {
  document.querySelector('.tab.active')?.classList.remove('active');
  button.classList.add('active');
  document.querySelectorAll('.tab').forEach(tab => tab.setAttribute('aria-selected', String(tab === button)));
  renderMenu(button.dataset.target);
}));

document.addEventListener('click', event => {
  const control = event.target.closest('[data-action]');
  if (!control) return;
  const { action, id } = control.dataset;
  if (action === 'add' || action === 'increase') setQuantity(id, 1);
  if (action === 'decrease') setQuantity(id, -1);
  if (action === 'remove') { order.delete(id); updateCart(); }
});

document.querySelector('#send-order').addEventListener('click', () => {
  const selected = selectedProducts();
  if (selected.length === 0) {
    orderFeedback.textContent = 'Adicione pelo menos um produto ao pedido para continuar.';
    return;
  }
  const mode = selectedMode();
  if (!mode) {
    orderFeedback.textContent = 'Selecione consumo no local, retirada no local ou entrega.';
    document.querySelector('.order-mode').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  if (mode === 'delivery' && (!neighborhoodInput.value.trim() || !addressInput.value.trim())) {
    orderFeedback.textContent = 'Informe o bairro e o endereço para entrega.';
    (!neighborhoodInput.value.trim() ? neighborhoodInput : addressInput).focus();
    return;
  }

  const { hasUnpriced, amount: total } = productTotals(selected);
  const lines = selected.map(item => `- ${item.quantity}x ${item.name}${item.description ? ` (${item.description})` : ''}${item.price == null ? ' — valor a confirmar' : ` — ${money(item.price * item.quantity)}`}`);
  const productTotalLine = hasUnpriced
    ? (total ? `Subtotal dos produtos com preço informado: ${money(total)}. Há item(ns) com valor a confirmar.` : 'Valor dos produtos a confirmar; há item sem preço informado.')
    : `Total dos produtos: ${money(total)}.`;
  const modeLine = mode === 'local'
    ? 'Modalidade: Consumo no local (pedido para consumir no estabelecimento).'
    : `Modalidade: ${modeLabels[mode]}.`;
  let deliveryAddressLine = '';
  let deliveryFee = null;
  if (mode === 'delivery') {
    deliveryFee = configuredDeliveryFee(neighborhoodInput.value);
    deliveryAddressLine = `Endereço: ${addressInput.value.trim()}, ${neighborhoodInput.value.trim()}.`;
  }
  const deliveryTotalLines = mode !== 'delivery' ? '' : `\nTaxa de entrega: ${deliveryFee == null ? 'a confirmar.' : `${money(deliveryFee)}.`}\nTotal final: ${deliveryFee == null ? (hasUnpriced ? 'a confirmar após confirmação do valor dos produtos e definição da taxa de entrega.' : 'a confirmar após definição da taxa de entrega.') : hasUnpriced ? 'a confirmar após definição do valor dos produtos.' : `${money(total + deliveryFee)} (estimado).`}`;
  const message = `Olá! Gostaria de fazer um pedido na Os Piratas — Pastelaria e Restaurante.\n\n${modeLine}${deliveryAddressLine ? `\n${deliveryAddressLine}` : ''}\n\nPedido:\n${lines.join('\n')}\n\n${productTotalLine}${deliveryTotalLines}\n\nAguardo a confirmação, por favor!`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
});

document.querySelectorAll('input[name="order-mode"]').forEach(input => input.addEventListener('change', () => {
  orderFeedback.textContent = '';
  updateDeliveryFields();
}));
[neighborhoodInput, addressInput].forEach(input => input.addEventListener('input', () => {
  orderFeedback.textContent = '';
  updateDeliveryFields();
}));

const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
toggle.addEventListener('click', () => {
  const expanded = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(expanded));
  toggle.setAttribute('aria-label', expanded ? 'Fechar menu' : 'Abrir menu');
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}));
document.querySelector('#mobile-cart-open').addEventListener('click', () => document.querySelector('#pedido').scrollIntoView({ behavior: 'smooth', block: 'center' }));

renderMenu('pasteis');
updateCart();
