<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const name = ref('')
const password = ref('')

const login = async () => {
    try {
        const response = await axios.post(
            'http://localhost:3001/login',
            {
                name: name.value,
                password: password.value
            },
            {
                withCredentials: true
            }
        )

        const role = response.data.user.role

        if (role === 'Oppilas') {
            router.push('/oppilas')
        }
        else if (role === 'Opettaja') {
            router.push('/opettaja')
        }
        else if (role === 'Ohjaaja') {
            router.push('/ohjaaja')
        }

    } catch (error) {
        console.error(error)
        alert('Väärä käyttäjänimi tai salasana')
    }
}


</script>

<template>
    <div>
        <h1>Login</h1>

        <form @submit.prevent="login">
            <input
                v-model="name"
                type="text"
                placeholder="Name"
            />

            <input
                v-model="password"
                type="password"
                placeholder="Password"
            />

            <button type="submit">
                Login
            </button>
        </form>
    </div>
</template>
