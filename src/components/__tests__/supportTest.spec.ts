import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import SupportPage from '@/views/SupportPage.vue';
import { createRouter, createMemoryHistory } from 'vue-router';
import flushPromises from 'flush-promises';

vi.mock('vue-cookies', () => ({
  default: {
    get: vi.fn(() => 'mockPassengerID'),
  },
}));

const mockToast = {
    error: vi.fn(),
    success: vi.fn()
}
vi.mock('vue-toastification', () => ({
    useToast: () => mockToast,
}));

describe('SupportPage.vue', () => {
  let wrapper: any;
  let router: any;

  beforeEach(async () => {
    router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/main', component: { template: '<div>Main Page</div>' } }],
    });

    wrapper = mount(SupportPage, {
      global: {
        plugins: [router],
      },
    });

    await flushPromises();
  });

  it('Főoldalra vissza irányítás', async () => {
    await wrapper.find('ion-fab-button').trigger('click');
    await flushPromises();
    expect(router.currentRoute.value.path).toBe('/main');
  });

  it('Hiba cím értékének ellenőrzése', () => {
    const errorTitle = wrapper.find('#title');
    expect(errorTitle.exists()).toBe(true);
    errorTitle.setValue('Hosszú hiba címe');
    expect(wrapper.vm.supportTitle).toBe('Hosszú hiba címe');
  });

  it('Hiba leírás értékének ellenőrzése', () => {
    const errorMessage = wrapper.find('#message');
    expect(errorMessage.exists()).toBe(true);
    errorMessage.setValue('Hosszú hiba hosszú leírása');
    expect(wrapper.vm.supportMessage).toBe('Hosszú hiba hosszú leírása');
  });
  it('Hiba beküldés ellenőrzés sikeres', async () => {
    wrapper.vm.supportTitle = 'Hiba cím';
    wrapper.vm.supportMessage = 'Hiba leírás';
    await wrapper.find('#sendBtn').trigger('click');
    await flushPromises();
    expect(mockToast.success).toHaveBeenCalledWith('Sikeresen elküldve!');
  });
  it('Hiba beküldés ellenőrzés hibás adatokkal', async () => {
    wrapper.vm.supportTitle = 'Hiba cím';
    wrapper.vm.supportMessage = '';
    await wrapper.find('#sendBtn').trigger('click');
    await flushPromises();
    expect(mockToast.error).toHaveBeenCalledWith('Kérjük, töltse ki az összes mezőt!');
  });
});