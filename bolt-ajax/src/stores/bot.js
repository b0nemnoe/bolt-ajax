import { ref, watch, computed } from "vue"
import { defineStore } from "pinia"
import axios from "axios"
import { useToast } from "vue-toastification"
import { OhVueIcon, addIcons } from "oh-vue-icons";
import { BiBagCheckFill } from "oh-vue-icons/icons";
import { h } from "vue"
import router from '../router' 

addIcons(BiBagCheckFill);

export const BACKEND_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api', '') 
  : "http://localhost:3000";

export const useBotStore = defineStore("bot", () => {
  const products = ref([])
  const cart = ref({})
  const token = ref(localStorage.getItem('token') || '') 
  const user = ref(JSON.parse(localStorage.getItem('user')) || null) 
  const myOrders = ref([])
  const adminOrders = ref([]) 
  const isLoading = ref(false) 
  const toast = useToast()
  const currentProduct = ref(null)
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  const searchQuery = ref('')
  const onlyInStock = ref(false)
  const sortOrder = ref('default')

  const filteredProducts = computed(() => {
    if (!products.value) return []
    let result = products.value.filter(p => {
      const term = searchQuery.value.toLowerCase()
      const matchesSearch = p.name.toLowerCase().includes(term) || 
                            (p.desc && p.desc.toLowerCase().includes(term))
      const matchesStock = onlyInStock.value ? p.store > 0 : true
      return matchesSearch && matchesStock
    })
    if (sortOrder.value === 'asc') return [...result].sort((a, b) => a.price - b.price)
    if (sortOrder.value === 'desc') return [...result].sort((a, b) => b.price - a.price)
    return result
  })

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password })
      token.value = response.data.token
      user.value = response.data.user
      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))
      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
      toast.success("Sikeres bejelentkezés!")
      if (user.value.isAdmin) router.push('/admin-orders')
      else router.push('/')
    } catch (error) {
      toast.error(error.response?.data?.message || "Hibás bejelentkezés!")
    }
  }

  const register = async (email, password) => {
    try {
      await axios.post(`${API_URL}/auth/register`, { email, password })
      toast.success("Sikeres regisztráció!")
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

  const loadAll = async () => {
    isLoading.value = true;
    try {
      const response = await axios.get(`${API_URL}/products`)
      products.value = response.data || []
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        try { cart.value = JSON.parse(savedCart) } catch(e) { cart.value = {} }
      }
      if (cart.value && products.value.length > 0) {
          for (const id in cart.value) {
            const product = products.value.find((p) => p.id == id || p._id == id)
            if (product) product.store -= cart.value[id]
          }
      }
    } catch (error) {
      console.error(error)
      toast.error("Nem sikerült betölteni a termékeket!")
    } finally {
      isLoading.value = false;
    }
  };

  const fetchAdminOrders = async () => {
    if (!token.value || !user.value?.isAdmin) return
    try {
      const response = await axios.get(`${API_URL}/orders/all`)
      adminOrders.value = response.data
    } catch (error) {
      toast.error("Hiba a rendelések betöltésekor")
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`${API_URL}/orders/${orderId}`, { status: newStatus })
      toast.success("Státusz frissítve!")
      const order = adminOrders.value.find(o => o._id === orderId)
      if (order) order.status = newStatus
    } catch (error) {
      toast.error("Hiba a módosításkor")
    }
  }

  const fetchProductById = async (id) => {
    isLoading.value = true
    currentProduct.value = null
    try {
      const response = await axios.get(`${API_URL}/products/${id}`)
      currentProduct.value = response.data
    } catch (error) {
      console.error(error)
      toast.error("Nem sikerült betölteni a terméket!")
      router.push('/')
    } finally {
      isLoading.value = false
    }
  }

  const addToCart = (id) => {
    const product = products.value.find((p) => p.id == id || p._id == id)
    if (!product) { toast.error("A termék nem elérhető!"); return }
    if (product.store === 0) { toast.error("Nincs készleten"); return; }
    if (!cart.value) cart.value = {}
    cart.value[id] = cart.value[id] ? cart.value[id] + 1 : 1;
    product.store--
    localStorage.setItem("cart", JSON.stringify(cart.value))
    toast("Kosárhoz adva", { icon: h(OhVueIcon, { name: "bi-bag-check-fill", class: "font-size: 2rem", animation: "wrench" }) });
  };

  const countTotal = () => {
    let total = 0
    if (!cart.value) return 0
    for (const i in cart.value) {
      const p = products.value.find((p) => p.id == i || p._id == i)
      if(p) total += cart.value[i] * p.price
    }
    return total
  }

  const emptyCart = () => {
    if (!cart.value) return
    for (const key in cart.value) {
        const p = products.value.find((p) => p.id == key || p._id == key)
        if(p) p.store += cart.value[key]
    }
    cart.value = {}
    toast.error("Kosár kiürítve")
  };

  const deleteProductFromCart = (id) => {
    const product = products.value.find((p) => p.id == id || p._id == id)
    if (product) { product.store += cart.value[id] }
    delete cart.value[id]
    toast.error("Termék törölve a kosárból!")
  }

  const modifyQuantity = (id, op) => {
    if (!cart.value || !cart.value[id]) return 
    const product = products.value.find((p) => p.id == id || p._id == id)
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

  const checkout = async () => {
    if (!token.value) {
      toast.error("A rendeléshez be kell jelentkezned!");
      router.push('/login');
      return;
    }
    const orderItems = [];
    for (const id in cart.value) {
      const product = products.value.find((p) => p.id == id || p._id == id);
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
    try {
      await axios.post(`${API_URL}/orders`, {
        items: orderItems,
        totalPrice: total
      });
      toast.success("Rendelés sikeresen leadva!");
      cart.value = {}; 
      localStorage.removeItem('cart');
      await loadAll(); 
      router.push('/'); 
    } catch (error) {
      toast.error("Hiba a rendelés során: " + (error.response?.data?.message || error.message));
    }
  }

  const fetchOrders = async () => {
    if (!token.value) return 
    try {
      const response = await axios.get(`${API_URL}/orders`)
      myOrders.value = response.data
    } catch (error) {
      console.error("Hiba a rendelések betöltésekor:", error)
    }
  }

  const saveProduct = (p) => {
    axios.post(`${API_URL}/products`, p)
      .then((resp) => {
        products.value.push(resp.data) 
        toast.success("Sikeres mentés")
        router.push('/')
      })
      .catch((err) => toast.error("Hiba: " + (err.response?.data?.message || err.message)));
  };

  const updateProduct = (product) => {
    axios.put(`${API_URL}/products/${product.id}`, product)
      .then(() => {
        const index = products.value.findIndex(p => p.id === product.id)
        if (index !== -1) {
           products.value[index] = { ...product }
        }
        toast.success("Sikeres módosítás")
      })
      .catch((error) => {
        console.error(error)
        toast.error("Hiba a módosításkor")
      })
  }

  const deleteProductFromDb = (identifier) => {
    let product = products.value.find(p => p.id == identifier || p.name === identifier)
    if (!product) {
      toast.error("A termék nem található!")
      return
    }
    axios.delete(`${API_URL}/products/${product.id}`)
      .then(() => {
        toast.success("Sikeres törlés")
        products.value = products.value.filter((p) => p.id !== product.id)
      })
      .catch(() => toast.error("Hiba a törléskor"))
  }

  watch(cart, (newCart) => {
    localStorage.setItem("cart", JSON.stringify(newCart))
  }, { deep: true })

  return {
    products, 
    filteredProducts, 
    searchQuery, 
    onlyInStock, 
    sortOrder, 
    cart, 
    token, 
    user, myOrders, 
    adminOrders,
    toast,
    isLoading,
    currentProduct,
    loadAll, 
    addToCart, 
    saveProduct, 
    updateProduct, 
    emptyCart, 
    countTotal, 
    deleteProductFromCart, 
    modifyQuantity,
    deleteProductFromDb, 
    login, 
    register, 
    logout, 
    checkout, 
    fetchOrders, 
    fetchAdminOrders, 
    updateOrderStatus,
    fetchProductById,
  }
})