<template>
    <div class="container mt-4">
        <h1 class="mb-4">Termékek kezelése</h1>
        
        <div class="table-responsive">
            <table class="table table-striped table-hover align-middle">
                <thead class="table-dark">
                    <tr>
                        <th>Név</th>
                        <th>Ár</th>
                        <th>Egység</th>
                        <th>Leírás</th>
                        <th>Készlet</th>
                        <th class="text-center">Műveletek</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="product in bolt.products" :key="product.id">
                        
                        <template v-if="editingId === product.id">
                            <td><input type="text" class="form-control" v-model="editData.name"></td>
                            <td><input type="text" class="form-control" v-model="editData.price"></td>
                            <td><input type="text" class="form-control" v-model="editData.unit" style="width: 80px;"></td>
                            <td><input type="text" class="form-control" v-model="editData.desc"></td>
                            <td><input type="number" class="form-control" v-model.number="editData.store" style="width: 80px;"></td>
                            <td class="text-center">
                                <button class="btn btn-success btn-sm me-2" @click="saveEdit(product.id)">
                                    💾 Mentés
                                </button>
                                <button class="btn btn-secondary btn-sm" @click="cancelEdit">
                                    ❌ Mégse
                                </button>
                            </td>
                        </template>

                        <template v-else>
                            <td>{{ product.name }}</td>
                            <td>{{ product.price }}</td>
                            <td>{{ product.unit }}</td>
                            <td>{{ product.desc }}</td>
                            <td>
                                <span :class="{'text-danger fw-bold': product.store === 0, 'text-success': product.store > 0}">
                                    {{ product.store }} db
                                </span>
                            </td>
                            <td class="text-center">
                                <button class="btn btn-primary btn-sm me-2" @click="startEdit(product)">
                                    ✏️
                                </button>
                                <button class="btn btn-danger btn-sm" @click="bolt.deleteProductFromDb(product.id)">
                                    🗑️
                                </button>
                            </td>
                        </template>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div v-if="bolt.products.length === 0" class="alert alert-warning text-center">
            Nincs megjeleníthető termék.
        </div>
    </div>
</template>

<script setup>
    import { ref } from 'vue'
    import { useBotStore } from '@/stores/bot'
    
    const bolt = useBotStore()
    
    // Szerkesztéshez szükséges változók
    const editingId = ref(null) // Melyik ID-t szerkesztjük éppen
    const editData = ref({})    // Ideiglenes tároló a módosításoknak

    // Szerkesztés indítása: átmásoljuk az adatokat az ideiglenes tárolóba
    const startEdit = (product) => {
        editingId.value = product.id
        editData.value = { ...product } // Másolat készítése, hogy ne azonnal frissüljön a nézet
    }

    // Szerkesztés mentése
    const saveEdit = () => {
        bolt.updateProduct(editData.value)
        editingId.value = null // Kilépés a szerkesztés módból
    }

    // Mégse gomb
    const cancelEdit = () => {
        editingId.value = null
        editData.value = {}
    }
</script>

<style scoped>
.table input {
    min-width: 100px;
}
</style>