import { ComponentType } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { observer, inject } from '@tarojs/mobx'
import { AtDrawer, AtGrid, AtList, AtListItem, AtTabs } from 'taro-ui'

import contentsEn from '../../config/contentsEn'
import contentsCn from '../../config/contentsCn'

import './index.sass'

type PageStateProps = {
  counterStore: {
    counter: number,
    increment: Function,
    decrement: Function,
    incrementAsync: Function
  }
}

interface Index {
  props: PageStateProps;
}

@inject('counterStore')
@observer
class Index extends Component <any, any> {

  constructor (props) {
    super (props)
    this.state = {
      chapterLength: 10,
      visible: false,
      bookIndex: '',
      classify: 0,
    }
  }


  config: Config = {
    navigationBarTitleText: 'holy bible'
  }

  onClose = () => {
    this.setState({ visible: false })
  }

  handleClick = (item: any) => {
    this.setState({ chapterLength: item.length, visible: true, bookIndex: item.index })
  }

  handleChapterClick = (index: number) => {
    Taro.navigateTo({
      url: `/pages/books/index?bookIndex=${this.state.bookIndex}&chapter=${index + 1}`
    })
  }

  handleTabsClick = (type: string, index: number) => {
    this.setState({ [type]: index })
  }

  render () {

    const oldBiblesEn = contentsEn.slice(0, 39)
    const newBiblesEn = contentsEn.slice(39)

    const oldBiblesCn = contentsCn.slice(0, 39)
    const newBiblesCn = contentsCn.slice(39)

    const drawerList: any[] = []

    for (let i = 0; i < this.state.chapterLength; i++) {
      drawerList.push(`chapter ${i + 1}`)
    }
    const classifys = [{ title: '旧约' }, { title: '新约' }]
    return (
      <View className='books-contents'>
        <AtTabs current={this.state.classify} tabList={classifys} onClick={this.handleTabsClick.bind(this, 'classify')} />
        { this.state.classify === 0 ?
          <AtGrid
            data={oldBiblesEn.map((item: any, index: number) => ({ value: oldBiblesCn[index].name + '\n' + item.name, length: item.length, index: index }))}
            onClick={this.handleClick.bind(this)}
          /> : 
          <AtGrid
            data={newBiblesEn.map((item: any, index: number) => ({ value: newBiblesCn[index].name + '\n' + item.name, length: item.length, index: index }))}
            onClick={this.handleClick.bind(this)}
          />
        }
        <AtDrawer 
          className="books-chapter-drawer"
          show={this.state.visible} 
          right
          mask
          onClose={this.onClose.bind(this)} 
        >{
          <AtList>
            {
              drawerList.map((item, index) => <AtListItem key={item} note={item} arrow='right' onClick={this.handleChapterClick.bind(this, index)} />)
            }
          </AtList>
        }</AtDrawer>
      </View>
    )
  }
}

export default Index as ComponentType
