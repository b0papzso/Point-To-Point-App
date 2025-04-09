import { describe, it, expect } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginPage.vue' 
import RegisterPage from '@/views/RegisterPage.vue'
import {mount} from '@vue/test-utils'
describe('Login', () => {
    it('Hibás adatok ellenőrzése', () => {
        const wrapper = mount(LoginView)
        wrapper.find("#email").setValue("nemLetezo@email.com")
        wrapper.find("#password").setValue("jelszo")
        wrapper.find(".login-button").trigger("click")
        setTimeout(() => {
        expect(wrapper.vm.errorMessage).toBe("Hibás email cím vagy jelszó!")
        }, 1000)
    }),
    it('Helyes adatok ellenőrzése',() => {
        const wrapper = mount(LoginView)
        wrapper.find("#email").setValue("michael.jordan@example.com")
        wrapper.find("#password").setValue("MJ@123")
        wrapper.find(".login-button").trigger("click")
        setTimeout(() => {
            expect(wrapper.vm.errorMessage).toBe("")
        }, 1000)
    }),
    it('Üres mezők ellenőrzése', () => {
        const wrapper = mount(LoginView)
        wrapper.find("#email").setValue("")
        wrapper.find("#password").setValue("")
        wrapper.find(".login-button").trigger("click")
        setTimeout(() => {
            expect(wrapper.vm.errorMessage).toBe("Minden mező kitöltése kötelező!")
        }, 1000)
    }),
    it('Regisztráció oldalra átirányítás', async() => { 
        const router = createRouter({
            history: createWebHistory(),
            routes: [
                { path: '/register', component: () =>  RegisterPage}
            ]
        })
        
        const wrapper = mount(LoginView, {
            global: {
                plugins: [router]
            }
        })
        
        await wrapper.find("#register").trigger("click")
        await router.isReady()
        setTimeout(() => {
        expect(router.currentRoute.value.path).toBe('/register')
        }, 1000)
    }),
    it('Maradjak bejelentkezve igaz',() => {
        const wrapper = mount(LoginView)
        wrapper.find(".login-button").trigger("click")
        setTimeout(() => {
        expect(wrapper.vm.stayLoggedIn.value).toBe(true)
        },1000)
    }),
    it('Maradjak bejelentkezve hamis',() => {
        const wrapper = mount(LoginView)
        wrapper.find(".login-button").trigger("click")
        expect(wrapper.vm.stayLoggedIn).toBe(false)
    })
    
})