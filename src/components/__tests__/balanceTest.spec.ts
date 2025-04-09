import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import BalancePage from '@/views/BalancePage.vue';
import { createRouter, createMemoryHistory } from 'vue-router';
import flushPromises from 'flush-promises';

vi.mock('@/components/refreshToken.js', () => {
  const mockApiGet = vi.fn(() => Promise.resolve({ data: { balance: 100 } }));

  const mockApiPatch = vi.fn((url, data) => {
    if (!Array.isArray(data)) {
        console.error("Mock API Patch nem array-t kapott:", data);
        return Promise.reject(new Error("Hibás adat struktúra!"));
    }
    const replaceOp = data.find(op => op.op === 'replace' && op.path === '/balance');
    const newBalance = replaceOp ? parseFloat(replaceOp.value) : null;

    if (newBalance === null || isNaN(newBalance)) {
      console.error("Mock API Patch nem tudta átalakítani az adatot:", data);
      return Promise.reject(new Error("Hibás patch adat!"));
    }
    return Promise.resolve({ data: { balance: newBalance } });
  });
  return {
    default: {
      get: mockApiGet,
      patch: mockApiPatch,
    },
  };
});

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

describe('BalancePage.vue', () => {
  let wrapper: any;
  let router: any;

  beforeEach(async () => {
    router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/main', component: { template: '<div>Main Page</div>' } }],
    });

    wrapper = mount(BalancePage, {
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

  it('Pillanatnyi egyenleg megjelenítése', async () => {
    expect(wrapper.html()).toContain('Egyenleg: 100$');
  });

  it('Egyenleg hozzáadás form megjelenítése és elrejtése', async () => {
    const toggleButton = wrapper.find('button.btn-success');
    expect(wrapper.find('.topUpDiv').exists()).toBe(false);
    await toggleButton.trigger('click');
    expect(wrapper.find('.topUpDiv').exists()).toBe(true);
    await toggleButton.trigger('click');
    expect(wrapper.find('.topUpDiv').exists()).toBe(false);
  });

  it('Nagyon kis adat beírásának ellenőrzése', async () => {
    const topUpButton = wrapper.find('button.btn-success');
    await topUpButton.trigger('click');
    const input = wrapper.find('input');
    await input.setValue(0.01);
    await wrapper.find('.topUpDiv button').trigger('click');
    expect(mockToast.error).toHaveBeenCalledWith('Legalább 5$-t kell hozzáadnia!');
  });
  it('Valós szám hozzáadása', async () => {
    const topUpButton = wrapper.find('button.btn-success');
    await topUpButton.trigger('click');
    await wrapper.vm.$nextTick();
    const input = wrapper.find('input[type="number"]');
    await input.setValue(6.73);
    const submitButton = wrapper.find('.topUpDiv button.btn-success');
    await submitButton.trigger('click');
    await flushPromises();
    expect(wrapper.html()).toContain('Egyenleg: 106.73$');
  });
  it('Negatív összeg beírása', async () => {
    const topUpButton = wrapper.find('button.btn-success');
    await topUpButton.trigger('click');
    const input = wrapper.find('input');
    await input.setValue(-1);
    await wrapper.find('.topUpDiv button').trigger('click');
    expect(mockToast.error).toHaveBeenCalledWith('Legalább 5$-t kell hozzáadnia!');
  });

  it('Nagyon nagy összeg hozzáadása', async () => {
    const topUpButton = wrapper.find('button.btn-success');
    await topUpButton.trigger('click');
    const input = wrapper.find('input');
    await input.setValue(10000);
    await wrapper.find('.topUpDiv button').trigger('click');
    expect(mockToast.error).toHaveBeenCalledWith('Legfeljebb 500$-t tud hozzáadni!');
  });
  it('Nagyon nagy negatív összeg hozzáadása', async () => {
    const topUpButton = wrapper.find('button.btn-success');
    await topUpButton.trigger('click');
    const input = wrapper.find('input');
    await input.setValue(-10000);
    await wrapper.find('.topUpDiv button').trigger('click');
    expect(mockToast.error).toHaveBeenCalledWith('Legalább 5$-t kell hozzáadnia!');
  });

  it('Egyenleghez helyes szám hozzáadása', async () => {
    const topUpButton = wrapper.find('button.btn-success');
    await topUpButton.trigger('click');
    const input = wrapper.find('input');
    await input.setValue(50);
    await wrapper.find('.topUpDiv button').trigger('click');
    await flushPromises();
    expect(wrapper.html()).toContain('Egyenleg: 150$');
  });
});