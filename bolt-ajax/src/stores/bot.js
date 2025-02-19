import { ref, computed } from "vue";
import { defineStore } from "pinia";
import axios from "axios";
import { useToast } from "vue-toastification";

export const useBotStore = defineStore("bot", () => {
  const products = ref([]);
  const cart = ref({});
  const toast = useToast();

  const loadAll = () => {
    fetch("http://localhost:3000/bolt")
      .then((resp) => resp.json())
      .then((data) => (products.value = data));
  };

  const addToCart = (id) => {
    cart.value[id] = cart.value[id] ? cart.value[id] + 1 : 1;
    toast("Kosárhoz adva");
    products.value.find((p) => p.id == id).store -= 1;
  };

  const saveProduct = (p) => {
    console.log(p);
    //let id = Math.round(Math.random() * 1000000000)
    products.value.push(p);
    axios
      .post("http://localhost:3000/bolt", p)
      .then((resp) => {
        console.log(resp.statusText);
        toast("Sikeres mentés");
      })
      .catch(() => toast.error("Hiba"));
  };

  const emptyCart = () => {
    for (const key in cart.value) {
      products.value.find((p) => p.id == key).store += cart.value[key];
    }
    cart.value = {};
    toast.error("Kosár kiürítve");
  };

  const countTotal = () => {
    let total = 0;
    for (const i in cart.value) {
      total +=
        cart.value[i] * parseFloat(products.value.find((p) => p.id == i).price);
    }
    return total;
  };

  const deleteProduct = (id) => {
    products.value.find((p) => p.id == id).store += cart.value[id];
    delete cart.value[id];
    toast.error("Termék törölve a kosárból!");
  };

  return {
    products,
    cart,
    loadAll,
    addToCart,
    saveProduct,
    emptyCart,
    countTotal,
    deleteProduct,
  };
});
