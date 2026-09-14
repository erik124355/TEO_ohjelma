<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import '../style.css'

const router = useRouter()
const activePage = ref('oppilaat')
const userName = ref('')

const teojaksot = ref([])
const selectedTeo = ref(null)
const diaryEntries = ref([])

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

const loadTeojaksot = async () => {
    try {
        const response = await axios.get(
            'http://localhost:3001/ohjaaja/teojaksot',
            { withCredentials: true }
        )

        teojaksot.value = response.data
    } catch (error) {
        console.error(error)
        teojaksot.value = []
        alert('TEO-jaksojen hakeminen epäonnistui')
    }
}

const getDiaryEntries = async (teoId) => {
    try {
        const response = await axios.get(
            `http://localhost:3001/ohjaaja/paivakirja/${teoId}`,
            { withCredentials: true }
        )

        diaryEntries.value = response.data
    } catch (error) {
        console.error(error)
        diaryEntries.value = []
    }
}

const selectTeo = async (teo) => {
    if (selectedTeo.value?.TeojaksoID === teo.TeojaksoID) {
        selectedTeo.value = null
        diaryEntries.value = []
        return
    }

    selectedTeo.value = teo
    await getDiaryEntries(teo.TeojaksoID)
}

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

onMounted(() => {
    getUser()
    loadTeojaksot()
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
                    @click="activePage = 'oppilaat'"
                    :class="{ active: activePage === 'oppilaat' }"
                >
                    Oppilaat
                </button>
            </nav>

            <button class="logout-button" @click="logout">
                Kirjaudu ulos
            </button>
        </aside>

        <main class="content">
            <div v-if="activePage === 'oppilaat'">
                <div class="page-header">
                    <div>
                        <h1>Ohjaajan oppilaat</h1>
                        <p>Katso oppilaiden TEO-jaksot ja päivittäiset merkinnät.</p>
                    </div>
                </div>

                <div v-if="teojaksot.length === 0" class="table-card">
                    <p>Sinulle ei ole liitettyjä oppilaita TEO-jaksoihin.</p>
                </div>

                <div class="teo-list" v-else>
                    <button
                        v-for="(teo, index) in teojaksot"
                        :key="teo.TeojaksoID"
                        class="teo-item"
                        :class="{ selected: selectedTeo?.TeojaksoID === teo.TeojaksoID }"
                        @click="selectTeo(teo)"
                    >
                        <div>
                            <strong>{{ teo.StudentName }}</strong>
                            <small>{{ teo.Luokka }}</small>
                        </div>

                        <div class="teo-summary">
                            <span>TEO {{ index + 1 }}</span>
                            <small>{{ teo.Alku }} – {{ teo.Loppu }}</small>
                        </div>

                        <span class="teo-arrow">
                            {{ selectedTeo?.TeojaksoID === teo.TeojaksoID ? '▲' : '▼' }}
                        </span>
                    </button>
                </div>

                <div v-if="selectedTeo" class="teo-card">
                    <h2>{{ selectedTeo.StudentName }}</h2>

                    <div class="teo-details">
                        <div class="form-group">
                            <label><b>TEO-jakson kesto:</b></label>
                            <p>{{ selectedTeo.Alku }} – {{ selectedTeo.Loppu }}</p>
                        </div>

                        <div class="form-group">
                            <label><b>Luokka:</b></label>
                            <p>{{ selectedTeo.Luokka || 'Ei luokkaa' }}</p>
                        </div>

                        <div class="form-group">
                            <label><b>Työpaikka:</b></label>
                            <p>{{ selectedTeo.Tyopaikka || 'Ei määritetty' }}</p>
                        </div>

                        <div class="form-group">
                            <label><b>Näytön tila:</b></label>
                            <p>{{ selectedTeo.NayttoTila || 'Ei näyttöä' }}</p>
                        </div>

                        <div class="form-group">
                            <label><b>Arvosana:</b></label>
                            <p>{{ selectedTeo.Arvosana ?? 'Ei arvosanaa' }}</p>
                        </div>
                    </div>

                    <div class="diary-section">
                        <h3>Päiväkirjamerkinnät</h3>

                        <div v-if="diaryEntries.length === 0" class="no-teos">
                            Oppilaalla ei ole päiväkirjamerkintöjä tähän TEO-jaksoon.
                        </div>

                        <div
                            v-for="entry in diaryEntries"
                            :key="entry.PaivakirjaID"
                            class="diary-entry"
                        >
                            <strong>{{ entry.Paiva }}</strong>
                            <p>{{ entry.Paivitys }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>
