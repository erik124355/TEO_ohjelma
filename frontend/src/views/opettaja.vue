<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import '../style.css'

const router = useRouter()

const activePage = ref('oppilaat')
const userName = ref('')

const students = ref([])
const teachers = ref([])
const supervisors = ref([])

const selectedClass = ref('')
const selectedStudent = ref(null)
const selectedTeo = ref(null)
const teoJaksot = ref([])
const showTeoEditor = ref(false)

const selectedNaytto = ref(null)
const nayttoForm = ref({
    arvosana: '',
    tila: 'Kesken'
})

const selectedNayttoStudent = ref(null)
const selectedNayttoTeo = ref(null)
const nayttoTeoJaksot = ref([])

const showAddForm = ref(false)
const showEditForm = ref(false)

const newStudent = ref({
    name: '',
    luokka: '',
    password: ''
})

const editingStudent = ref({
    id: null,
    name: '',
    luokka: '',
    password: ''
})

const teoForm = ref({
    alku: '',
    loppu: '',
    tyopaikka: '',
    opettaja: '',
    ohjaaja: ''
})

const diaryEntries = ref([])
const showDiary = ref(false)


// =========================
// KÄYTTÄJÄ
// =========================

const getUser = async () => {
    try {
        const response = await axios.get(
            'http://localhost:3001/session',
            {
                withCredentials: true
            }
        )

        userName.value = response.data.user.name

    } catch (error) {
        console.error(error)
    }
}


// =========================
// OPPILAAT
// =========================

const getStudents = async () => {
    try {
        const response = await axios.get(
            'http://localhost:3001/students',
            {
                withCredentials: true
            }
        )

        students.value = response.data

    } catch (error) {
        console.error(error)
        alert('Oppilaiden hakeminen epäonnistui')
    }
}


// Luokat ilman duplikaatteja
const classes = computed(() => {
    return [...new Set(
        students.value
            .map(student => student.Luokka)
            .filter(luokka => luokka)
    )].sort()
})


// Valitun luokan oppilaat
const filteredStudents = computed(() => {

    if (!selectedClass.value) {
        return students.value
    }

    return students.value.filter(
        student => student.Luokka === selectedClass.value
    )
})


// =========================
// OPPILAAN LISÄÄMINEN
// =========================

const addStudent = async () => {

    try {

        await axios.post(
            'http://localhost:3001/students',
            {
                name: newStudent.value.name,
                luokka: newStudent.value.luokka,
                password: newStudent.value.password
            },
            {
                withCredentials: true
            }
        )

        newStudent.value = {
            name: '',
            luokka: '',
            password: ''
        }

        showAddForm.value = false

        await getStudents()

    } catch (error) {

        console.error(error)

        if (error.response) {
            alert(error.response.data.message)
        } else {
            alert('Oppilaan lisääminen epäonnistui')
        }
    }
}


// =========================
// OPPILAAN MUOKKAAMINEN
// =========================

const editStudent = (student) => {

    editingStudent.value = {
        id: student.UserID,
        name: student.Name,
        luokka: student.Luokka,
        password: ''
    }

    showEditForm.value = true
}


const updateStudent = async () => {

    try {

        await axios.put(
            `http://localhost:3001/students/${editingStudent.value.id}`,
            {
                name: editingStudent.value.name,
                luokka: editingStudent.value.luokka,
                password: editingStudent.value.password
            },
            {
                withCredentials: true
            }
        )

        showEditForm.value = false

        editingStudent.value = {
            id: null,
            name: '',
            luokka: '',
            password: ''
        }

        await getStudents()

    } catch (error) {

        console.error(error)

        if (error.response) {
            alert(error.response.data.message)
        } else {
            alert('Oppilaan muokkaaminen epäonnistui')
        }
    }
}


// =========================
// OPPILAAN POISTAMINEN
// =========================

const deleteStudent = async (id) => {

    const confirmed = confirm(
        'Haluatko varmasti poistaa tämän oppilaan?'
    )

    if (!confirmed) {
        return
    }

    try {

        await axios.delete(
            `http://localhost:3001/students/${id}`,
            {
                withCredentials: true
            }
        )

        await getStudents()

    } catch (error) {

        console.error(error)

        if (error.response) {
            alert(error.response.data.message)
        } else {
            alert('Oppilaan poistaminen epäonnistui')
        }
    }
}


// =========================
// TEO-JAKSOT
// =========================

// Haetaan opettajat ja ohjaajat
const getStaff = async () => {

    try {

        const response = await axios.get(
            'http://localhost:3001/staff',
            {
                withCredentials: true
            }
        )

        teachers.value = response.data.teachers
        supervisors.value = response.data.supervisors

    } catch (error) {

        console.error(error)
        alert('Opettajien ja ohjaajien hakeminen epäonnistui')
    }
}


// Valitaan oppilas
const selectStudent = async (student) => {

    // Jos sama oppilas klikataan uudelleen, suljetaan editori
    if (selectedStudent.value?.UserID === student.UserID) {

        selectedStudent.value = null
        selectedTeo.value = null
        showTeoEditor.value = false
        teoJaksot.value = []

        return
    }

    selectedStudent.value = student
    selectedTeo.value = null
    showTeoEditor.value = false

    try {

        const response = await axios.get(
            `http://localhost:3001/teojaksot/student/${student.UserID}`,
            {
                withCredentials: true
            }
        )

        teoJaksot.value = response.data

        teoForm.value = {
            alku: '',
            loppu: '',
            tyopaikka: '',
            opettaja: '',
            ohjaaja: ''
        }

    } catch (error) {

        console.error(error)

        teoJaksot.value = []
        selectedTeo.value = null

        teoForm.value = {
            alku: '',
            loppu: '',
            tyopaikka: '',
            opettaja: '',
            ohjaaja: ''
        }
    }
}


// Tallennetaan TEO-jakso
const saveTeo = async () => {

    if (!selectedStudent.value) {
        return
    }

    if (!teoForm.value.alku || !teoForm.value.loppu) {
        alert('Valitse alku- ja loppupäivä')
        return
    }

    if (teoForm.value.loppu < teoForm.value.alku) {
        alert('Loppupäivä ei voi olla ennen alkupäivää')
        return
    }

    try {

        await axios.post(
            'http://localhost:3001/teojaksot',
            {
                opiskelija: selectedStudent.value.UserID,
                alku: teoForm.value.alku,
                loppu: teoForm.value.loppu,
                tyopaikka: teoForm.value.tyopaikka,
                opettaja: teoForm.value.opettaja,
                ohjaaja: teoForm.value.ohjaaja
            },
            {
                withCredentials: true
            }
        )

        alert('TEO-jakso tallennettu')

        await selectStudent(selectedStudent.value)

    } catch (error) {

        console.error(error)

        if (error.response) {
            alert(error.response.data.message)
        } else {
            alert('TEO-jakson tallentaminen epäonnistui')
        }
    }
}


// Muokataan olemassa olevaa TEO-jaksoa
const updateTeo = async () => {

    if (!selectedTeo.value) {
        return
    }

    try {

        await axios.put(
            `http://localhost:3001/teojaksot/${selectedTeo.value.TeojaksoID}`,
            {
                alku: teoForm.value.alku,
                loppu: teoForm.value.loppu,
                tyopaikka: teoForm.value.tyopaikka,
                opettaja: teoForm.value.opettaja,
                ohjaaja: teoForm.value.ohjaaja
            },
            {
                withCredentials: true
            }
        )

        alert('TEO-jakso päivitetty')

        await selectStudent(selectedStudent.value)

    } catch (error) {

        console.error(error)

        if (error.response) {
            alert(error.response.data.message)
        } else {
            alert('TEO-jakson päivittäminen epäonnistui')
        }
    }
}

// avataan / suljetaan TEO-lehti
const openTeo = (teo) => {

    // Jos sama TEO-jakso on jo auki, suljetaan se
    if (selectedTeo.value?.TeojaksoID === teo.TeojaksoID) {

        selectedTeo.value = null
        showTeoEditor.value = false

        return
    }

    // Muuten avataan TEO-jakso
    selectedTeo.value = teo
    showTeoEditor.value = true

    teoForm.value = {
        alku: teo.Alku || '',
        loppu: teo.Loppu || '',
        tyopaikka: teo.Tyopaikka || '',
        opettaja: teo.Opettaja || '',
        ohjaaja: teo.Ohjaaja || ''
    }
}
//uusi teo
const newTeo = () => {

    selectedTeo.value = null
    showTeoEditor.value = true

    teoForm.value = {
        alku: '',
        loppu: '',
        tyopaikka: '',
        opettaja: '',
        ohjaaja: ''
    }
}
// =========================
// Näytöt
// =========================

//haetaa näyttö
const getNaytto = async (teoId) => {

    try {

        const response = await axios.get(
            `http://localhost:3001/naytot/teojakso/${teoId}`,
            {
                withCredentials: true
            }
        )

        if (response.data) {

            selectedNaytto.value = response.data

            nayttoForm.value = {
                arvosana: response.data.Arvosana || '',
                tila: response.data.Tila || 'Kesken'
            }

        } else {

            selectedNaytto.value = null

            nayttoForm.value = {
                arvosana: '',
                tila: 'Kesken'
            }
        }

    } catch (error) {

        console.error(error)

        selectedNaytto.value = null

        nayttoForm.value = {
            arvosana: '',
            tila: 'Kesken'
        }
    }
}

//valitaan näyttö
const selectNayttoTeo = async (teo) => {

    // Jos sama TEO-jakso klikataan uudelleen
    if (selectedNayttoTeo.value?.TeojaksoID === teo.TeojaksoID) {

        selectedNayttoTeo.value = null
        selectedTeo.value = null
        selectedNaytto.value = null

        showDiary.value = false
        diaryEntries.value = []

        nayttoForm.value = {
            arvosana: '',
            tila: 'Kesken'
        }

        return
    }

    // Avataan uusi TEO-jakso
    selectedNayttoTeo.value = teo
    selectedTeo.value = teo

    // Suljetaan vanhan TEO-jakson päiväkirja
    showDiary.value = false
    diaryEntries.value = []

    await getNaytto(teo.TeojaksoID)
}

//tallenetaan näyttö
const saveNaytto = async () => {

    if (!selectedNayttoTeo.value) {
        return
    }

    try {

        await axios.post(
            'http://localhost:3001/naytot',
            {
                paiva: new Date().toISOString().split('T')[0],
                arvosana: nayttoForm.value.arvosana || null,
                tila: nayttoForm.value.tila,
                teojakso: selectedNayttoTeo.value.TeojaksoID
            },
            {
                withCredentials: true
            }
        )

        alert('Näyttö tallennettu')

        await getNaytto(selectedNayttoTeo.value.TeojaksoID)

    } catch (error) {

        console.error(error)

        if (error.response) {
            alert(error.response.data.message)
        } else {
            alert('Näytön tallentaminen epäonnistui')
        }
    }
}

//pävitetään näyttö
const updateNaytto = async () => {

    if (!selectedNaytto.value) {
        return
    }

    try {

        await axios.put(
            `http://localhost:3001/naytot/${selectedNaytto.value.NayttoID}`,
            {
                paiva: selectedNaytto.value.Paiva,
                arvosana: nayttoForm.value.arvosana || null,
                tila: nayttoForm.value.tila
            },
            {
                withCredentials: true
            }
        )

        alert('Näyttö päivitetty')

        await getNaytto(selectedNayttoTeo.value.TeojaksoID)

    } catch (error) {

        console.error(error)

        if (error.response) {
            alert(error.response.data.message)
        } else {
            alert('Näytön päivittäminen epäonnistui')
        }
    }
}

const selectNayttoStudent = async (student) => {

    selectedNayttoStudent.value = student
    selectedNayttoTeo.value = null

    try {

        const response = await axios.get(
            `http://localhost:3001/teojaksot/student/${student.UserID}`,
            {
                withCredentials: true
            }
        )

        nayttoTeoJaksot.value = response.data

    } catch (error) {

        console.error(error)
        nayttoTeoJaksot.value = []
    }
}


const resetTeoSelection = () => {
    selectedStudent.value = null
    selectedTeo.value = null
    showTeoEditor.value = false
    teoJaksot.value = []
    teoForm.value = {
        alku: '',
        loppu: '',
        tyopaikka: '',
        opettaja: '',
        ohjaaja: ''
    }
}

const resetNayttoSelection = () => {
    selectedNayttoStudent.value = null
    selectedNayttoTeo.value = null
    selectedNaytto.value = null
    nayttoTeoJaksot.value = []
    nayttoForm.value = {
        arvosana: '',
        tila: 'Kesken'
    }
}

const changePage = (page) => {
    activePage.value = page

    if (page !== 'teojaksot') {
        resetTeoSelection()
    }

    if (page !== 'naytot') {
        resetNayttoSelection()
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
            {
                withCredentials: true
            }
        )

        router.push('/')

    } catch (error) {

        console.error(error)
        alert('Uloskirjautuminen epäonnistui')
    }
}

// =========================
// PÄIVÄKIRJA
// =========================

const getDiaryEntries = async (teoId) => {

    try {

        const response = await axios.get(
            `http://localhost:3001/opettaja/paivakirja/${teoId}`,
            {
                withCredentials: true
            }
        )

        diaryEntries.value = response.data

    } catch (error) {

        console.error(error)

        diaryEntries.value = []

        alert('Päiväkirjamerkintöjen hakeminen epäonnistui')
    }
}

const toggleDiary = async () => {

    if (!selectedNayttoTeo.value) {
        return
    }

    // Jos päiväkirja on jo auki, suljetaan se
    if (showDiary.value) {

        showDiary.value = false
        diaryEntries.value = []

        return
    }

    // Avataan päiväkirja
    showDiary.value = true

    await getDiaryEntries(
        selectedNayttoTeo.value.TeojaksoID
    )
}

// =========================
// SIVUN AVAUS
// =========================

onMounted(() => {

    getUser()
    getStudents()
    getStaff()

})
</script>


<template>

    <div class="layout">

        <!-- SIDEBAR -->

        <aside class="sidebar">

            <div class="sidebar-header">
                <h2>{{ userName }}</h2>
            </div>

            <nav>
                <button
                    @click="changePage('oppilaat')"
                    :class="{ active: activePage === 'oppilaat' }"
                >
                    Oppilaat
                </button>

                <button
                    @click="changePage('teojaksot')"
                    :class="{ active: activePage === 'teojaksot' }"
                >
                    TEO-jaksot
                </button>

                <button
                    @click="changePage('naytot')"
                    :class="{ active: activePage === 'naytot' }"
                >
                    Näytöt
                </button>
            </nav>

            <button
                class="logout-button"
                @click="logout"
            >
                Kirjaudu ulos
            </button>

        </aside>


        <!-- MAIN CONTENT -->

        <main class="content">


            <!-- ===================== -->
            <!-- OPPILAAT -->
            <!-- ===================== -->

            <div v-if="activePage === 'oppilaat'">

                <div class="page-header">

                    <div>
                        <h1>Oppilaat</h1>
                        <p>Hallitse oppilaiden käyttäjätietoja.</p>
                    </div>

                    <button
                        class="add-button"
                        @click="showAddForm = true"
                    >
                        + Lisää oppilas
                    </button>

                </div>


                <div class="table-card">

                    <table>

                        <thead>
                            <tr>
                                <th>Nimi</th>
                                <th>Luokka</th>
                                <th>Rooli</th>
                                <th>Toiminnot</th>
                            </tr>
                        </thead>

                        <tbody>

                            <tr
                                v-for="student in students"
                                :key="student.UserID"
                            >

                                <td>{{ student.Name }}</td>

                                <td>{{ student.Luokka }}</td>

                                <td>{{ student.Role }}</td>

                                <td>

                                    <div class="actions">

                                        <button
                                            class="edit-button"
                                            @click="editStudent(student)"
                                        >
                                            Muokkaa
                                        </button>

                                        <button
                                            class="delete-button"
                                            @click="deleteStudent(student.UserID)"
                                        >
                                            Poista
                                        </button>

                                    </div>

                                </td>

                            </tr>

                            <tr v-if="students.length === 0">

                                <td
                                    colspan="4"
                                    style="text-align: center;"
                                >
                                    Ei oppilaita
                                </td>

                            </tr>

                        </tbody>

                    </table>

                </div>

            </div>


            <!-- ===================== -->
            <!-- TEO-JAKSOT -->
            <!-- ===================== -->

            <div v-if="activePage === 'teojaksot'">

                <div class="page-header">

                    <div>
                        <h1>TEO-jaksot</h1>
                        <p>Hallitse oppilaiden työssäoppimisjaksoja.</p>
                    </div>

                </div>


                <!-- LUOKAN VALINTA -->

                <div class="teo-selection">

                    <label>Valitse luokka</label>

                    <select v-model="selectedClass">

                        <option value="">
                            Kaikki luokat
                        </option>

                        <option
                            v-for="luokka in classes"
                            :key="luokka"
                            :value="luokka"
                        >
                            {{ luokka }}
                        </option>

                    </select>

                </div>


                <div class="teo-layout">


                    <!-- OPPILAAT -->

                    <div class="table-card student-list">

                        <h2>Oppilaat</h2>

                        <button
                            v-for="student in filteredStudents"
                            :key="student.UserID"
                            class="student-select"
                            :class="{
                                selected: selectedStudent?.UserID === student.UserID
                            }"
                            @click="selectStudent(student)"
                        >
                            <span>{{ student.Name }}</span>
                            <small>{{ student.Luokka }}</small>
                        </button>

                    </div>


                    <!-- TEO FORM -->

<div class="teo-card">

    <div v-if="!selectedStudent">

        <h2>Valitse oppilas</h2>

        <p>
            Valitse vasemmalta oppilas,
            jonka TEO-jaksoa haluat hallita.
        </p>

    </div>


    <div v-else>

        <h2>{{ selectedStudent.Name }}</h2>

        <p class="student-class">
            {{ selectedStudent.Luokka }}
        </p>


        <!-- OLEMASSA OLEVAT TEO-JAKSOT -->

        <div class="existing-teos">

            <h3>TEO-jaksot</h3>

            <div
                v-if="teoJaksot.length === 0"
                class="no-teos"
            >
                Oppilaalle ei ole vielä luotu TEO-jaksoja.
            </div>


            <button
                v-for="(teo, index) in teoJaksot"
                :key="teo.TeojaksoID"
                class="teo-item"
                :class="{
                    selected: selectedTeo?.TeojaksoID === teo.TeojaksoID
                }"
                @click="openTeo(teo)"
            >

                <span>
                    TEO-jakso {{ index + 1 }}
                </span>

                <span class="teo-arrow">
                    →
                </span>

            </button>

        </div>


        <!-- UUDEN TEO-JAKSON LISÄÄMINEN -->

        <button
            class="add-button new-teo-button"
            @click="newTeo"
        >
            + Lisää TEO-jakso
        </button>


        <!-- TEO FORM -->

        <div
            v-if="showTeoEditor"
            class="teo-editor"
        >

            <h3>
                {{ selectedTeo
                    ? 'TEO-jakson muokkaaminen'
                    : 'Uusi TEO-jakso'
                }}
            </h3>


            <div class="calendar">

                <h3>TEO-jakson ajankohta</h3>

                <div class="date-row">

                    <div class="form-group">

                        <label>Alkupäivä</label>

                        <input
                            v-model="teoForm.alku"
                            type="date"
                        >

                    </div>


                    <div class="form-group">

                        <label>Loppupäivä</label>

                        <input
                            v-model="teoForm.loppu"
                            type="date"
                        >

                    </div>

                </div>

            </div>


            <div class="teo-details">

                <h3>TEO-jakson tiedot</h3>


                <div class="form-group">

                    <label>Työpaikka</label>

                    <input
                        v-model="teoForm.tyopaikka"
                        type="text"
                        placeholder="Työpaikan nimi"
                    >

                </div>


                <div class="form-group">

                    <label>Opettaja</label>

                    <select v-model="teoForm.opettaja">

                        <option value="">
                            Valitse opettaja
                        </option>

                        <option
                            v-for="teacher in teachers"
                            :key="teacher.UserID"
                            :value="teacher.UserID"
                        >
                            {{ teacher.Name }}
                        </option>

                    </select>

                </div>


                <div class="form-group">

                    <label>Ohjaaja</label>

                    <select v-model="teoForm.ohjaaja">

                        <option value="">
                            Valitse ohjaaja
                        </option>

                        <option
                            v-for="supervisor in supervisors"
                            :key="supervisor.UserID"
                            :value="supervisor.UserID"
                        >
                            {{ supervisor.Name }}
                        </option>

                    </select>

                </div>

            </div>


            <button
                v-if="selectedTeo"
                class="add-button"
                @click="updateTeo"
            >
                Tallenna muutokset
            </button>


            <button
                v-else
                class="add-button"
                @click="saveTeo"
            >
                Luo TEO-jakso
            </button>

        </div>

    </div>

</div>

                </div>

            </div>
 
            <!-- ===================== -->
            <!-- NÄYTÖT -->
            <!-- ===================== -->

            <div v-if="activePage === 'naytot'">

                <div class="page-header">

                    <div>
                        <h1>Näytöt</h1>
                        <p>Hallitse opiskelijoiden näyttöjä.</p>
                    </div>

                </div>


                <div class="teo-layout">


                    <!-- OPPILAAT -->

                    <div class="table-card student-list">

                        <h2>Oppilaat</h2>

                        <button
                            v-for="student in students"
                            :key="student.UserID"
                            class="student-select"
                            :class="{
                                selected: selectedNayttoStudent?.UserID === student.UserID
                            }"
                            @click="selectNayttoStudent(student)"
                        >
                            <span>{{ student.Name }}</span>
                            <small>{{ student.Luokka }}</small>
                        </button>

                    </div>


                    <!-- TEO-JAKSOT -->

                    <div class="teo-card">

                        <div v-if="!selectedNayttoStudent">

                            <h2>Valitse oppilas</h2>

                            <p>
                                Valitse oppilas, jonka näyttöä haluat hallita.
                            </p>

                        </div>


                        <div v-else>

                            <h2>{{ selectedNayttoStudent.Name }}</h2>

                            <p class="student-class">
                                {{ selectedNayttoStudent.Luokka }}
                            </p>


                            <div class="existing-teos">

                                <h3>TEO-jaksot</h3>

                                <div
                                    v-if="nayttoTeoJaksot.length === 0"
                                    class="no-teos"
                                >
                                    Oppilaalle ei ole vielä luotu TEO-jaksoja.
                                </div>


                                <button
                                    v-for="(teo, index) in nayttoTeoJaksot"
                                    :key="teo.TeojaksoID"
                                    class="teo-item"
                                    :class="{
                                        selected: selectedNayttoTeo?.TeojaksoID === teo.TeojaksoID
                                    }"
                                    @click="selectNayttoTeo(teo)"
                                >

                                    <span>
                                        TEO-jakso {{ index + 1 }}
                                    </span>

                                    <span class="teo-arrow">
                                        →
                                    </span>

                                </button>

                            </div>


                            <!-- NÄYTÖN MUOKKAUS -->

                            <div
                                v-if="selectedNayttoTeo"
                                class="teo-editor"
                            >

                                <h3>
                                    Näyttö
                                </h3>


                                <!-- ARVIOINTI -->

                                <div class="teo-details">

                                    <h3>Arviointi</h3>


                                    <div class="form-group">

                                        <label>Arvosana</label>

                                        <select v-model="nayttoForm.arvosana">

                                            <option value="">
                                                Ei arvosanaa
                                            </option>

                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                            <option value="4">4</option>
                                            <option value="5">5</option>

                                        </select>

                                    </div>


                                    <div class="form-group">

                                        <label>Tila</label>

                                        <select v-model="nayttoForm.tila">

                                            <option value="Kesken">
                                                Kesken
                                            </option>

                                            <option value="Hylätty">
                                                Hylätty
                                            </option>

                                            <option value="Valmis">
                                                Valmis
                                            </option>

                                        </select>

                                    </div>

                                </div>


                                <!-- NÄYTÖN TALLENNUS -->

                                <button
                                    v-if="selectedNaytto"
                                    class="add-button"
                                    @click="updateNaytto"
                                >
                                    Tallenna muutokset
                                </button>


                                <button
                                    v-else
                                    class="add-button"
                                    @click="saveNaytto"
                                >
                                    Tallenna näyttö
                                </button>


                                <!-- PÄIVÄKIRJA -->

                                <div class="diary-section">

                                    <button
                                        class="edit-button"
                                        @click="toggleDiary"
                                    >
                                        {{
                                            showDiary
                                                ? 'Piilota päiväkirjamerkinnät'
                                                : 'Näytä päiväkirjamerkinnät'
                                        }}
                                    </button>


                                    <div
                                        v-if="showDiary"
                                        class="diary-entries"
                                    >

                                        <h3>
                                            Päiväkirjamerkinnät
                                        </h3>


                                        <!-- EI MERKINTÖJÄ -->

                                        <div
                                            v-if="diaryEntries.length === 0"
                                            class="no-teos"
                                        >
                                            Oppilaalla ei ole päiväkirjamerkintöjä tähän TEO-jaksoon.
                                        </div>


                                        <!-- MERKINNÄT -->

                                        <div
                                            v-for="entry in diaryEntries"
                                            :key="entry.PaivakirjaID"
                                            class="diary-entry"
                                        >

                                            <strong>
                                                {{ entry.Paiva }}
                                            </strong>

                                            <p>
                                                {{ entry.Paivitys }}
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            </div>

                            </div>

                    </div>

                </div>

            </div>

        </main>


        <!-- ADD STUDENT MODAL -->

        <div
            v-if="showAddForm"
            class="modal-overlay"
            @click.self="showAddForm = false"
        >

            <div class="modal">

                <div class="modal-header">

                    <h2>Lisää oppilas</h2>

                    <button
                        class="close-button"
                        @click="showAddForm = false"
                    >
                        ×
                    </button>

                </div>

                <form @submit.prevent="addStudent">

                    <div class="form-group">

                        <label>Nimi</label>

                        <input
                            v-model="newStudent.name"
                            type="text"
                            placeholder="Oppilaan nimi"
                            required
                        >

                    </div>

                    <div class="form-group">

                        <label>Luokka</label>

                        <input
                            v-model="newStudent.luokka"
                            type="text"
                            placeholder="Esim. K3TVT24C"
                            required
                        >

                    </div>

                    <div class="form-group">

                        <label>Salasana</label>

                        <input
                            v-model="newStudent.password"
                            type="password"
                            placeholder="Salasana"
                            required
                        >

                    </div>

                    <div class="modal-actions">

                        <button
                            type="button"
                            class="cancel-button"
                            @click="showAddForm = false"
                        >
                            Peruuta
                        </button>

                        <button
                            type="submit"
                            class="add-button"
                        >
                            Lisää oppilas
                        </button>

                    </div>

                </form>

            </div>

        </div>

        


        <!-- EDIT STUDENT MODAL -->

        <div
            v-if="showEditForm"
            class="modal-overlay"
            @click.self="showEditForm = false"
        >

            <div class="modal">

                <div class="modal-header">

                    <h2>Muokkaa oppilasta</h2>

                    <button
                        class="close-button"
                        @click="showEditForm = false"
                    >
                        ×
                    </button>

                </div>

                <form @submit.prevent="updateStudent">

                    <div class="form-group">

                        <label>Nimi</label>

                        <input
                            v-model="editingStudent.name"
                            type="text"
                            required
                        >

                    </div>

                    <div class="form-group">

                        <label>Luokka</label>

                        <input
                            v-model="editingStudent.luokka"
                            type="text"
                            required
                        >

                    </div>

                    <div class="form-group">

                        <label>Uusi salasana</label>

                        <input
                            v-model="editingStudent.password"
                            type="password"
                            placeholder="Jätä tyhjäksi jos et vaihda"
                        >

                    </div>

                    <div class="modal-actions">

                        <button
                            type="button"
                            class="cancel-button"
                            @click="showEditForm = false"
                        >
                            Peruuta
                        </button>

                        <button
                            type="submit"
                            class="add-button"
                        >
                            Tallenna
                        </button>

                    </div>

                </form>

            </div>

            
        </div>

        

    </div>

</template>
