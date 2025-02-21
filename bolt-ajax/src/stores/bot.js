import { ref, computed, onMounted, watch } from "vue"
import { defineStore } from "pinia"
import axios from "axios"
import { useToast } from "vue-toastification"
import { OhVueIcon, addIcons } from "oh-vue-icons";
import { BiBagCheckFill } from "oh-vue-icons/icons";
import { h } from "vue"

addIcons(BiBagCheckFill);
export const useBotStore = defineStore("bot", () => {
  const products = ref([])
  const cart = ref({})
  const toast = useToast()
  

  const loadAll = async () => {
    try {
      const response = await fetch("http://localhost:3000/bolt")
      products.value = await response.json()

      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        cart.value = JSON.parse(savedCart)
      }

      for (const id in cart.value) {
        const product = products.value.find((p) => p.id == id)
        if (product) {
          product.store -= cart.value[id]
        }
      }
    } catch (error) {
      toast.error("Nem sikerült betölteni a termékeket!")
    }
  };

  onMounted(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      cart.value = JSON.parse(savedCart)
    }
    loadAll() 
  })

  watch(cart, (newCart) => {
    localStorage.setItem("cart", JSON.stringify(newCart))
  }, { deep: true })

  const addToCart = (id) => {
    const product = products.value.find((p) => p.id == id)
  
    if (!product) {
      toast.error("A termék nem elérhető!")
      return
    }
  
    if (product.store === 0) {
      toast.error("Nincs készleten")
      return;
    }
  
    cart.value[id] = cart.value[id] ? cart.value[id] + 1 : 1;
    product.store--
  
    localStorage.setItem("cart", JSON.stringify(cart.value))
    toast("Kosárhoz adva", {
      icon: h(OhVueIcon, 
        {
          name: "bi-bag-check-fill", 
          class: "font-size: 2rem", 
          animation: "wrench" }),
    });
  };
  
  const saveProduct = (p) => {
    console.log(p);
  
    // Generate a new numeric ID
    const maxId = products.value.reduce((max, product) => {
      const id = parseInt(product.id, 10);
      return id > max ? id : max;
    }, 0);
    p.id = (maxId + 1).toString();
  
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
      products.value.find((p) => p.id == key).store += cart.value[key]
    }
    cart.value = {}
    toast.error("Kosár kiürítve")
  };

  const countTotal = () => {
    let total = 0
    for (const i in cart.value) {
      total +=
        cart.value[i] * parseFloat(products.value.find((p) => p.id == i).price)
    }
    return total
  }

  const deleteProductFromCart = (id) => {
    const product = products.value.find((p) => p.id == id)
    if (product) {
      product.store += cart.value[id]
    }
    delete cart.value[id]
    toast.error("Termék törölve a kosárból!")
  }

  const modifyQuantity = (id, op) => {
    if (!cart.value[id]) return 
  
    const product = products.value.find((p) => p.id == id)
    if (!product) return

    if (op === "+") {
      if (cart.value[id] < product.store + cart.value[id]) {
        cart.value[id]++
        product.store--
        toast("Mennyiség növelve")
      } else {
        toast.error("Nincs több készleten!")
      }
    } else {
      if (cart.value[id] === 1) {
        delete cart.value[id]
        toast.error("Termék eltávolítva a kosárból!")
      } else {
        cart.value[id]--
        toast.warning("Mennyiség csökkentve")
      }
      product.store++
    }
  
    localStorage.setItem("cart", JSON.stringify(cart.value))
  }

  const deleteProductFromDb = (identifier) => {
    let product;
  
    if (!identifier) {
      toast.error("A termék nem található!")
      return
    }

  
    // Check if the identifier is a number (ID) or a string (name)
    if (isNaN(identifier)) {
      // Identifier is a name
      product = products.value.find((p) => p.name.toLowerCase() === identifier.toLowerCase())
    } else {
      // Identifier is an ID
      product = products.value.find((p) => p.id == identifier)
    }
  
    if (!product) {
      toast.error("A termék nem található!")
      return
    }
  
    axios
      .delete(`http://localhost:3000/bolt/${product.id}`)
      .then((resp) => {
        console.log(resp.statusText)
        toast("Sikeres törlés")
        // Remove the product from the local products array
        products.value = products.value.filter((p) => p.id !== product.id)
      })
      .catch(() => toast.error("Hiba"))
  }
  
  return {
    products,
    cart,
    loadAll,
    addToCart,
    saveProduct,
    emptyCart,
    countTotal,
    deleteProductFromCart,
    modifyQuantity,
    deleteProductFromDb,
  }
})