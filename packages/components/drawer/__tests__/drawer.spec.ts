import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { rAF } from '@element-plus/test-utils/tick'
import Drawer from '../src/drawer.vue'
import Button from '../../button/src/button.vue'

jest.useFakeTimers()

const _mount = (template: string, data: any, otherObj?: any) =>
  mount({
    components: {
      [Drawer.name]: Drawer,
      [Button.name]: Button,
    },
    template,
    data,
    ...otherObj,
  })
const title = 'Drawer Title'
const content = 'content'

describe('Drawer', () => {
  it('create', async () => {
    const wrapper = _mount(
      `
      <el-drawer :title="title" v-model="visible"></el-drawer>
      `,
      () => ({
        title,
        visible: true,
      })
    )
    await nextTick()
    await rAF()
    await nextTick()
    const wrapperEl = wrapper.find('.el-overlay').element as HTMLDivElement
    const headerEl = wrapper.find('.el-drawer__header').element

    await nextTick()
    expect(wrapperEl.style.display).not.toEqual('none')
    expect(headerEl.textContent).toEqual(title)
  })

  it('render correct content', async () => {
    const wrapper = _mount(
      `
      <el-drawer :title='title' v-model='visible'>
        <span>this is a sentence</span>
        <el-button @click='dialogVisible = false'>cancel</el-button>
        <el-button type='primary' @click='dialogVisible = false'>confirm</el-button>
      </el-drawer>
      `,
      () => ({
        title,
        visible: true,
      })
    )

    await nextTick()
    await rAF()
    await nextTick()
    expect(wrapper.find('.el-drawer__body span').element.textContent).toEqual(
      'this is a sentence'
    )
    const footerBtns = wrapper.findAll('.el-button')
    expect(footerBtns.length).toEqual(2)
    expect(footerBtns[0].find('span').element.textContent).toEqual('cancel')
    expect(footerBtns[1].find('span').element.textContent).toEqual('confirm')
  })

  it('should append to body, when append-to-body flag is true', async () => {
    const wrapper = _mount(
      `
      <el-drawer ref='d' :title='title' v-model='visible' :append-to-body='true'>
        <span> content </span>
      </el-drawer>
      `,
      () => ({
        title,
        visible: false,
      })
    )
    const vm = wrapper.vm as any

    vm.visible = true
    await nextTick()
    await rAF()
    await nextTick()
    expect(document.querySelector('.el-overlay')?.parentNode).toEqual(
      document.body
    )
  })

  it('should open and close drawer properly', async () => {
    const onClose = jest.fn()
    const onClosed = jest.fn()
    const onOpened = jest.fn()
    const wrapper = _mount(
      `
      <el-drawer :title='title' v-model='visible' @closed="onClosed" @close="onClose" @opened="onOpened">
        <span>${content}</span>
      </el-drawer>
      `,
      () => ({
        title,
        visible: false,
      }),
      {
        methods: {
          onOpened,
          onClose,
          onClosed,
        },
      }
    )
    const vm = wrapper.vm as any
    await nextTick()
    await rAF()
    await nextTick()
    expect(onOpened).not.toHaveBeenCalled()

    const drawerEl = wrapper.find('.el-overlay').element as HTMLDivElement
    expect(drawerEl.style.display).toEqual('none')

    vm.visible = true
    await nextTick()
    await rAF()
    expect(drawerEl.style.display).not.toEqual('none')
    expect(onOpened).toHaveBeenCalled()

    // vm.visible = false
    // await nextTick()
    // await rAF()
    // await nextTick()
    // expect(onClose).toHaveBeenCalled()
  })

  it('should destroy every child after drawer was closed when destroy-on-close flag is true', async () => {
    const wrapper = _mount(
      `
      <el-drawer :title='title' v-model='visible' :append-to-body='false' :destroy-on-close='true' ref='drawer'>
        <span>${content}</span>
      </el-drawer>
      `,
      () => ({
        title,
        visible: true,
      })
    )
    await nextTick()
    const vm = wrapper.vm as any

    await nextTick()
    await rAF()
    await nextTick()
    expect(wrapper.find('.el-drawer__body span').element.textContent).toEqual(
      content
    )
    vm.$refs.drawer.handleClose()
    await nextTick()
    await rAF()
    await nextTick()
    expect(wrapper.find('.el-drawer__body').exists()).toBe(false)
  })

  it('should close dialog by clicking the close button', async () => {
    const wrapper = _mount(
      `
      <el-drawer :title='title' v-model='visible' :append-to-body='false' :destroy-on-close='true' ref='drawer'>
        <span>${content}</span>
      </el-drawer>
      `,
      () => ({
        title,
        visible: true,
      })
    )
    await nextTick()
    await rAF()
    await nextTick()
    const vm = wrapper.vm as any

    await wrapper.find('.el-drawer__close-btn').trigger('click')
    await nextTick()
    await rAF()
    await nextTick()
    expect(vm.visible).toEqual(false)
  })

  it('should invoke before-close', async () => {
    const beforeClose = jest.fn()
    const wrapper = _mount(
      `
      <el-drawer
          :before-close='beforeClose'
          :title='title'
          v-model='visible'
          :append-to-body='true'
          :destroy-on-close='true'
          ref='drawer'
          >
        <span>${content}</span>
      </el-drawer>
      `,
      () => ({
        title,
        visible: true,
        beforeClose,
      })
    )
    const vm = wrapper.vm as any
    vm.$refs.drawer.handleClose()

    expect(beforeClose).toHaveBeenCalled()
  })

  it('should not show close button when show-close flag is false', async () => {
    const wrapper = _mount(
      `
      <el-drawer :title='title' v-model='visible' ref='drawer' :show-close='false'>
        <span>${content}</span>
      </el-drawer>
      `,
      () => ({
        title,
        visible: true,
      })
    )

    expect(wrapper.find('.el-drawer__close-btn').exists()).toBe(false)
  })

  it('should have custom classes when custom classes were given', async () => {
    const classes = 'some-custom-class'
    const wrapper = _mount(
      `
      <el-drawer :title='title' v-model='visible' ref='drawer' custom-class='${classes}'>
        <span>${content}</span>
      </el-drawer>
      `,
      () => ({
        title,
        visible: true,
      })
    )
    await nextTick()

    expect(wrapper.find(`.${classes}`).exists()).toBe(true)
  })

  it('should not render header when withHeader attribute is false', async () => {
    const wrapper = _mount(
      `
      <el-drawer :title='title' v-model='visible' ref='drawer' :with-header='false'>
        <span>${content}</span>
      </el-drawer>
      `,
      () => ({
        title,
        visible: true,
      })
    )

    expect(wrapper.find('.el-drawer__header').exists()).toBe(false)
  })

  describe('directions', () => {
    const renderer = (direction: string) => {
      return _mount(
        `
        <el-drawer :title='title' v-model='visible' direction='${direction}'>
          <span>${content}</span>
        </el-drawer>
        `,
        () => ({
          title,
          visible: true,
        })
      )
    }
    test('should render from left to right', async () => {
      const wrapper = renderer('ltr')
      await nextTick()
      expect(wrapper.find('.ltr').exists()).toBe(true)
    })

    test('should render from right to left', async () => {
      const wrapper = renderer('rtl')
      await nextTick()
      expect(wrapper.find('.rtl').exists()).toBe(true)
    })

    test('should render from top to bottom', async () => {
      const wrapper = renderer('ttb')
      await nextTick()
      expect(wrapper.find('.ttb').exists()).toBe(true)
    })

    test('should render from bottom to top', async () => {
      const wrapper = renderer('btt')
      await nextTick()
      expect(wrapper.find('.btt').exists()).toBe(true)
    })
  })

  test('events', async () => {
    const open = jest.fn()
    const opened = jest.fn()
    const close = jest.fn()
    const closed = jest.fn()
    const wrapper = _mount(
      `
      <el-drawer
        :title='title'
        v-model='visible'
        ref="drawer"
        @open="open"
        @opened="opened"
        @close="close"
        @closed="closed">
        <span>${content}</span>
      </el-drawer>
      `,
      () => ({
        title,
        visible: false,
      }),
      {
        methods: {
          close,
          closed,
          open,
          opened,
        },
      }
    )
    const vm = wrapper.vm as any
    const drawer = wrapper.findComponent(Drawer)

    vm.visible = true
    await nextTick()
    expect(open).toHaveBeenCalled()
    drawer.vm.$emit('opened')
    await nextTick()
    expect(opened).toHaveBeenCalled()
    expect(close).not.toHaveBeenCalled()
    expect(closed).not.toHaveBeenCalled()

    vm.visible = false
    await nextTick()
    expect(close).toHaveBeenCalled()
    drawer.vm.$emit('closed')
    expect(closed).toHaveBeenCalled()
  })

  describe('size', () => {
    const renderer = (size: string, isVertical: boolean) =>
      _mount(
        `
        <el-drawer :title='title' v-model='visible' direction='${
          isVertical ? 'ltr' : 'ttb'
        }' size='${size}'>
          <span>${content}</span>
        </el-drawer>
        `,
        () => ({
          visible: true,
          title,
        })
      )

    describe.each`
      size     | isVertical | key
      ${'50%'} | ${true}    | ${'width'}
      ${'30%'} | ${false}   | ${'height'}
    `(
      'sizing with directions',
      ({
        size,
        isVertical,
        key,
      }: {
        size: string
        isVertical: boolean
        key: 'width' | 'height'
      }) => {
        it('should render correctly', async () => {
          const wrapper = renderer(size, isVertical)
          await nextTick()
          const drawerEl = wrapper.find('.el-drawer').element as HTMLDivElement
          expect(drawerEl.style[key]).toEqual(size)
        })
      }
    )
  })
})
