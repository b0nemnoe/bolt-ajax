import { ref, watch, onMounted } from "vue"
import { defineStore } from "pinia"
import axios from "axios"
import { useToast } from "vue-toastification"
import { OhVueIcon, addIcons } from "oh-vue-icons";
import { BiBagCheckFill } from "oh-vue-icons/icons";
import { h } from "vue"
import router from '../router'

addIcons(BiBagCheckFill);

export const useBotStore = defineStore("bot", () => {
  const products = ref([])
  const cart = ref({})
  const token = ref(localStorage.getItem('token') || '') // Token betöltése
  const user = ref(JSON.parse(localStorage.getItem('user')) || null) // User adatok
  const toast = useToast()
  
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

  // Ha van token, beállítjuk az axios fejlécét indításkor
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  // --- HITELESÍTÉS (LOGIN / REGISTER) ---

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password })
      
      // Sikeres belépés: adatok mentése
      token.value = response.data.token
      user.value = response.data.user
      
      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))
      
      // Axios fejléc beállítása minden jövőbeli kéréshez
      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
      
      toast.success("Sikeres bejelentkezés!")
      router.push('/') // Visszairányítás a főoldalra
    } catch (error) {
      toast.error(error.response?.data?.message || "Hibás bejelentkezés!")
    }
  }

  const register = async (email, password) => {
    try {
      await axios.post(`${API_URL}/auth/register`, { email, password })
      toast.success("Sikeres regisztráció! Most jelentkezz be.")
      router.push('/login')
    } catch (error) {
      toast.error(error.response?.data?.message || "Hiba történt!")
    }
  }

  const logout = () => {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
    toast.info("Kijelentkezve")
    router.push('/login')
  }

  // --- TERMÉKEK KEZELÉSE ---

  const loadAll = async () => {
    try {
      // Itt már az új backend végpontot hívjuk
      const response = await axios.get(`${API_URL}/products`)
      products.value = response.data
      
      // Kosár logika (marad a régi)
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        cart.value = JSON.parse(savedCart)
      }
      // Készlet frissítés a helyi kosár alapján
      for (const id in cart.value) {
        const product = products.value.find((p) => p.id == id)
        if (product) {
          product.store -= cart.value[id]
        }
      }
    } catch (error) {
      console.error(error)
      toast.error("Nem sikerült betölteni a termékeket!")
    }
  };

  // ... A KOSÁR KEZELÉS MARAD A RÉGI (addToCart, emptyCart, stb.) ...
  // Csak másold vissza a korábbi kódodból az alábbi függvényeket:
  // addToCart, countTotal, deleteProductFromCart, modifyQuantity

  const addToCart = (id) => {
    const product = products.value.find((p) => p.id == id)
    if (!product) { toast.error("A termék nem elérhető!"); return }
    if (product.store === 0) { toast.error("Nincs készleten"); return; }
    
    cart.value[id] = cart.value[id] ? cart.value[id] + 1 : 1;
    product.store--
    
    localStorage.setItem("cart", JSON.stringify(cart.value))
    toast("Kosárhoz adva", { icon: h(OhVueIcon, { name: "bi-bag-check-fill", class: "font-size: 2rem", animation: "wrench" }) });
  };

  // ... (A többi kosár függvény változatlan) ...
  
  const countTotal = () => {
    let total = 0
    for (const i in cart.value) {
      const p = products.value.find((p) => p.id == i)
      if(p) total += cart.value[i] * p.price
    }
    return total
  }

  const deleteProductFromCart = (id) => {
    const product = products.value.find((p) => p.id == id)
    if (product) { product.store += cart.value[id] }
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

  const emptyCart = () => {
    for (const key in cart.value) {
        const p = products.value.find((p) => p.id == key)
        if(p) p.store += cart.value[key]
    }
    cart.value = {}
    toast.error("Kosár kiürítve")
  };


  // --- ADMIN MŰVELETEK (MENTÉS, TÖRLÉS) ---

  const saveProduct = (p) => {
    axios.post(`${API_URL}/products`, p) // Ha 'p' egy FormData, az axios megoldja!
      .then((resp) => {
        products.value.push(resp.data) 
        toast.success("Sikeres mentés")
        router.push('/')
      })
      // ... hiba kezelés
  };

  const deleteProductFromDb = (identifier) => {
    // Keresés név vagy ID alapján (a frontend logikád szerint)
    let product;
    // Az ID most már string (Mongo ID), így az isNaN nem biztos, hogy elég, 
    // de a Mongo ID egyedi, a név pedig string. 
    // Egyszerűsítsünk: keressük meg a terméket a listában
    product = products.value.find(p => p.id == identifier || p.name === identifier)

    if (!product) {
      toast.error("A termék nem található!")
      return
    }
  
    axios.delete(`${API_URL}/products/${product.id}`)
      .then(() => {
        toast.success("Sikeres törlés")
        products.value = products.value.filter((p) => p.id !== product.id)
        router.push('/')
      })
      .catch(() => toast.error("Hiba a törléskor"))
  }

  // Watcher a kosár mentéshez
  watch(cart, (newCart) => {
    localStorage.setItem("cart", JSON.stringify(newCart))
  }, { deep: true })


  const checkout = async () => {
    // 1. Ellenőrzés: van-e bejelentkezve valaki?
    if (!token.value) {
      toast.error("A rendeléshez be kell jelentkezned!");
      router.push('/login');
      return;
    }

    // 2. Adatok előkészítése (Object -> Array konverzió)
    // A backend egy szép listát vár, de a kosarunk egy {id: db} objektum.
    const orderItems = [];
    for (const id in cart.value) {
      const product = products.value.find((p) => p.id == id);
      if (product) {
        orderItems.push({
          productId: id,
          name: product.name,
          quantity: cart.value[id],
          price: product.price
        });
      }
    }

    if (orderItems.length === 0) {
      toast.warning("Üres a kosarad!");
      return;
    }

    const total = countTotal();

    // 3. Küldés a backendnek
    try {
      await axios.post(`${API_URL}/orders`, {
        items: orderItems,
        totalPrice: total
      });

      toast.success("Rendelés sikeresen leadva!");
      
      // 4. Kosár ürítése (de okosan, ne tegye vissza a készletet, mert eladtuk!)
      cart.value = {}; 
      localStorage.removeItem('cart');

      await loadAll();
      
      router.push('/'); // Vissza a főoldalra
    } catch (error) {
      toast.error("Hiba a rendelés során: " + (error.response?.data?.message || error.message));
    }
  }

  const myOrders = ref([])

  const fetchOrders = async () => {
    if (!token.value) return 

    try {
      const response = await axios.get(`${API_URL}/orders`)
      myOrders.value = response.data
    } catch (error) {
      console.error("Hiba a rendelések betöltésekor:", error)
    }
  }

  return {
    products,
    cart,
    token,
    user,
    checkout,
    fetchOrders,
    myOrders,
    loadAll,
    addToCart,
    saveProduct,
    emptyCart,
    countTotal,
    deleteProductFromCart,
    modifyQuantity,
    deleteProductFromDb,
    login,
    register,
    logout
  }
})