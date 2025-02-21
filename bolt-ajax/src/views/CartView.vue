<template>
  <h1 class="text-center">Kosár</h1>
    <p v-if="Object.entries(botStore.cart).length < 1"> Üres a kosár!</p>
    <div v-else>
      <table class="table table-striped col-md-9">
        <thead>
          <tr>
            <th>Termék</th>
            <th>Ár</th>
            <th>Mennyiség</th>
            <th>Összesen</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(v, k) in botStore.cart">
            <td>{{ botStore.products.find(p => p.id === k).name }}</td>
            <td>{{ botStore.products.find(p => p.id === k).price }} </td>
            <td><span @click="botStore.modifyQuantity(k, '-')" class="btn btn-secondary">-</span><span class="p-2">{{ v }}</span> <span @click="botStore.modifyQuantity(k, '+')" class="btn btn-secondary">+</span></td>
            <td>{{ v * parseFloat(botStore.products.find(p => p.id === k).price) }} Ft</td>
            <td><span @click="botStore.deleteProductFromCart(k)" class="btn btn-danger">&#x1f5d1;</span></td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="fs-5">
            <td colspan="3">Végösszeg: </td>
            <td>{{ botStore.countTotal() }} Ft</td>
          </tr>
        </tfoot>
      </table>
      <button @click="botStore.emptyCart()" class="btn btn-outline-danger">Kosár kiürítése</button>
    </div>
</template>

<script setup>
  import {useBotStore} from '@/stores/bot.js'
  const botStore = useBotStore()



</script>