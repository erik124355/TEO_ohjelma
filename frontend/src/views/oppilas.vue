<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import '../style.css'

const router = useRouter()

const activePage = ref('teojaksot')
const userName = ref('')

// =========================
// TEO-JAKSOT
// =========================

const teoJaksot = ref([])
const selectedTeo = ref(null)
const expandedTeoIds = ref([])

// =========================
// PÄIVÄKIRJA
// =========================

const diaryEntries = ref([])

const diaryForm = ref({
    id: null,
    paiva: '',
    paivitys: ''
})

const isEditingDiary = ref(false)

// =========================
// KÄYTTÄJÄ
// =========================

const getUser = async () => {
    try {
        const response = await axios.get(
            'http://localhost:3001/session',
            { withCredentials: true }
        )

        userName.value = response.data.user.name
    } catch (error) {
        console.error(error)
    }
}

// =========================
// HAE OMAN OPPILAAN
// TEO-JAKSOT
// =========================

const getTeoJaksot = async () => {
    try {
        const response = await axios.get(
            'http://localhost:3001/teojaksot/my',
            { withCredentials: true }
        )

        teoJaksot.value = response.data
    } catch (error) {
        console.error(error)
        teoJaksot.value = []
        alert('TEO-jaksojen hakeminen epäonnistui')
    }
}

// =========================
// VALITSE TEO-JAKSO
// =========================

const selectTeo = async (teo) => {
    selectedTeo.value = teo
    await getDiaryEntries(teo.TeojaksoID)
}

// =========================
// AUKI/KIINI TEO-KORTTI
// =========================

const isTeoExpanded = (teoId) => {
    return expandedTeoIds.value.includes(teoId)
}

const toggleTeoCard = (teoId) => {
    const exists = expandedTeoIds.value.includes(teoId)

    if (exists) {
        expandedTeoIds.value = expandedTeoIds.value.filter(id => id !== teoId)
    } else {
        expandedTeoIds.value = [...expandedTeoIds.value, teoId]
    }
}

// =========================
// HAE PÄIVÄKIRJAMERKINNÄT
// =========================

const getDiaryEntries = async (teoId) => {
    try {
        const response = await axios.get(
            `http://localhost:3001/paivakirja/teojakso/${teoId}`,
            { withCredentials: true }
        )

        diaryEntries.value = response.data
    } catch (error) {
        console.error(error)
        diaryEntries.value = []
    }
}

// =========================
// TYHJENNÄ LOMAKE
// =========================

const resetDiaryForm = () => {
    diaryForm.value = {
        id: null,
        paiva: '',
        paivitys: ''
    }

    isEditingDiary.value = false
}

// =========================
// TALLENNA PÄIVÄKIRJA
// =========================

const saveDiaryEntry = async () => {
    if (!selectedTeo.value) {
        alert('Valitse ensin TEO-jakso')
        return
    }

    if (!diaryForm.value.paiva) {
        alert('Valitse päivä')
        return
    }

    if (!diaryForm.value.paivitys.trim()) {
        alert('Kirjoita päiväkirjamerkintä')
        return
    }

    try {
        await axios.post(
            'http://localhost:3001/paivakirja',
            {
                paiva: diaryForm.value.paiva,
                paivitys: diaryForm.value.paivitys,
                teojakso: selectedTeo.value.TeojaksoID
            },
            {
                withCredentials: true
            }
        )

        alert('Päiväkirjamerkintä tallennettu')

        resetDiaryForm()
        await getDiaryEntries(selectedTeo.value.TeojaksoID)
    } catch (error) {
        console.error(error)

        if (error.response) {
            alert(error.response.data.message)
        } else {
            alert('Päiväkirjamerkinnän tallentaminen epäonnistui')
        }
    }
}

// =========================
// ALOITA MUOKKAUS
// =========================

const editDiaryEntry = (entry) => {
    diaryForm.value = {
        id: entry.PaivakirjaID,
        paiva: entry.Paiva,
        paivitys: entry.Paivitys
    }

    isEditingDiary.value = true
}

// =========================
// PÄIVITÄ MERKINTÄ
// =========================

const updateDiaryEntry = async () => {
    if (!diaryForm.value.paivitys.trim()) {
        alert('Päiväkirjamerkintä ei voi olla tyhjä')
        return
    }

    try {
        await axios.put(
            `http://localhost:3001/paivakirja/${diaryForm.value.id}`,
            {
                paiva: diaryForm.value.paiva,
                paivitys: diaryForm.value.paivitys
            },
            {
                withCredentials: true
            }
        )

        alert('Päiväkirjamerkintä päivitetty')

        resetDiaryForm()
        await getDiaryEntries(selectedTeo.value.TeojaksoID)
    } catch (error) {
        console.error(error)

        if (error.response) {
            alert(error.response.data.message)
        } else {
            alert('Päiväkirjamerkinnän päivittäminen epäonnistui')
        }
    }
}

// =========================
// POISTA MERKINTÄ
// =========================

const deleteDiaryEntry = async (id) => {
    const confirmed = confirm(
        'Haluatko varmasti poistaa tämän päiväkirjamerkinnän?'
    )

    if (!confirmed) return

    try {
        await axios.delete(
            `http://localhost:3001/paivakirja/${id}`,
            { withCredentials: true }
        )

        await getDiaryEntries(selectedTeo.value.TeojaksoID)
    } catch (error) {
        console.error(error)

        if (error.response) {
            alert(error.response.data.message)
        } else {
            alert('Päiväkirjamerkinnän poistaminen epäonnistui')
        }
    }
}

// =========================
// SIVUN VAIHTO
// =========================

const changePage = (page) => {
    activePage.value = page

    if (page === 'teojaksot') {
        selectedTeo.value = null
        diaryEntries.value = []
        resetDiaryForm()
    }
}

// =========================
// LOGOUT
// =========================

const logout = async () => {
    try {
        await axios.post(
            'http://localhost:3001/logout',
            {},
            { withCredentials: true }
        )

        router.push('/')
    } catch (error) {
        console.error(error)
        alert('Uloskirjautuminen epäonnistui')
    }
}

// =========================
// SIVUN AVAUS
// =========================

onMounted(() => {
    getUser()
    getTeoJaksot()
})
</script>

<template>
    <div class="layout">
        <aside class="sidebar">
            <div class="sidebar-header">
                <h2>{{ userName }}</h2>
            </div>

            <nav>
                <button
                    @click="changePage('teojaksot')"
                    :class="{ active: activePage === 'teojaksot' }"
                >
                    TEO-jaksot
                </button>

                <button
                    @click="changePage('paivakirja')"
                    :class="{ active: activePage === 'paivakirja' }"
                >
                    Päiväkirja
                </button>
            </nav>

            <button class="logout-button" @click="logout">
                Kirjaudu ulos
            </button>
        </aside>

        <main class="content">
            <div v-if="activePage === 'teojaksot'">
                <div class="page-header">
                    <div>
                        <h1>Omat TEO-jaksot</h1>
                        <p>Näet täällä omat työssäoppimisjaksosi.</p>
                    </div>
                </div>

                <div v-if="teoJaksot.length === 0" class="table-card">
                    <p>Sinulle ei ole vielä lisätty TEO-jaksoja.</p>
                </div>

                <div
                    v-for="(teo, index) in teoJaksot"
                    :key="teo.TeojaksoID"
                    class="teo-accordion"
                >
                    <button
                        class="teo-accordion-header"
                        @click="toggleTeoCard(teo.TeojaksoID)"
                    >
                        <div class="teo-header-text">
                            <span class="teo-label">TEO-jakso {{ index + 1 }}</span>
                            <strong>{{ teo.Alku }} – {{ teo.Loppu }}</strong>
                        </div>

                        <span class="teo-toggle">
                            {{ isTeoExpanded(teo.TeojaksoID) ? '−' : '+' }}
                        </span>
                    </button>

                    <div
                        v-show="isTeoExpanded(teo.TeojaksoID)"
                        class="teo-accordion-content"
                    >
                        <div class="teo-details">
                            <div class="form-group">
                                <label><b>Työpaikka:</b></label>
                                <p>{{ teo.Tyopaikka || 'Ei määritetty' }}</p>
                            </div>

                            <div class="form-group">
                                <label><b>Opettaja:</b></label>
                                <p>{{ teo.OpettajaName || teo.Opettaja || 'Ei määritetty' }}</p>
                            </div>

                            <div class="form-group">
                                <label><b>Ohjaaja:</b></label>
                                <p>{{ teo.OhjaajaName || teo.Ohjaaja || 'Ei määritetty' }}</p>
                            </div>

                            <div class="form-group">
                                <label><b>Näytön tila:</b></label>
                                <p>{{ teo.Tila || 'Ei näyttöä' }}</p>
                            </div>

                            <div class="form-group">
                                <label><b>Arvosana:</b></label>
                                <p>{{ teo.Arvosana || 'Ei arvosanaa' }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="activePage === 'paivakirja'">
                <div class="page-header">
                    <div>
                        <h1>Päiväkirja</h1>
                        <p>Kirjaa päivittäiset tapahtumat TEO-jaksoltasi.</p>
                    </div>
                </div>

                <div class="teo-selection">
                    <label>Valitse TEO-jakso</label>

                    <select
                        v-model="selectedTeo"
                        @change="selectTeo(selectedTeo)"
                    >
                        <option :value="null">Valitse TEO-jakso</option>

                        <option
                            v-for="(teo, index) in teoJaksot"
                            :key="teo.TeojaksoID"
                            :value="teo"
                        >
                            TEO-jakso {{ index + 1 }} ({{ teo.Alku }} – {{ teo.Loppu }})
                        </option>
                    </select>
                </div>

                <div v-if="selectedTeo">
                    <div class="teo-card">
                        <h2>
                            {{ isEditingDiary ? 'Muokkaa päiväkirjamerkintää' : 'Uusi päiväkirjamerkintä' }}
                        </h2>

                        <div class="form-group">
                            <label>Päivä</label>
                            <input v-model="diaryForm.paiva" type="date">
                        </div>

                        <div class="form-group">
                            <label>Mitä teit tänään?</label>
                            <textarea
                                v-model="diaryForm.paivitys"
                                rows="8"
                                placeholder="Kirjoita tähän päivän tapahtumat..."
                            ></textarea>
                        </div>

                        <button
                            v-if="isEditingDiary"
                            class="add-button"
                            @click="updateDiaryEntry"
                        >
                            Tallenna muutokset
                        </button>

                        <button
                            v-else
                            class="add-button"
                            @click="saveDiaryEntry"
                        >
                            Tallenna merkintä
                        </button>

                        <button
                            v-if="isEditingDiary"
                            class="cancel-button"
                            @click="resetDiaryForm"
                        >
                            Peruuta
                        </button>
                    </div>

                    <div class="existing-teos">
                        <h2>Päiväkirjamerkinnät</h2>

                        <div v-if="diaryEntries.length === 0" class="no-teos">
                            Ei vielä päiväkirjamerkintöjä.
                        </div>

                        <div
                            v-for="entry in diaryEntries"
                            :key="entry.PaivakirjaID"
                            class="teo-card"
                        >
                            <h3>{{ entry.Paiva }}</h3>

                            <p>{{ entry.Paivitys }}</p>

                            <div class="actions">
                                <button class="edit-button" @click="editDiaryEntry(entry)">
                                    Muokkaa
                                </button>

                                <button
                                    class="delete-button"
                                    @click="deleteDiaryEntry(entry.PaivakirjaID)"
                                >
                                    Poista
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-else class="table-card">
                    <p>Valitse ensin TEO-jakso.</p>
                </div>
            </div>
        </main>
    </div>
</template>
