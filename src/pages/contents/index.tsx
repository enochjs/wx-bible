import { ComponentType } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { observer, inject } from '@tarojs/mobx'
import { AtDrawer, AtGrid, AtList, AtListItem } from 'taro-ui'

import bibleContents from '../../contents'

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
      book: '',
    }
  }


  config: Config = {
    navigationBarTitleText: 'holy bible'
  }

  componentWillMount () { }

  componentWillReact () {
    console.log('componentWillReact')
  }

  onClose = () => {
    this.setState({ visible: false })
  }

  handleClick = (item: any) => {
    const book: any = bibleContents.find(i => i.name === item.value)
    this.setState({ chapterLength: book.length, visible: true, book: item.value })

  }

  handleChapterClick = (index) => {
    Taro.navigateTo({
      url: `/pages/books/index?book=${this.state.book}&chapter=${index + 1}`
    })
  }

  render () {
    const oldBibles = bibleContents.slice(0, 39)
    const newBibles = bibleContents.slice(39)

    const drawerList: any[] = []

    for (let i = 0; i < this.state.chapterLength; i++) {
      drawerList.push(`chapter ${i + 1}`)
    }

    return (
      <View className='books-contents'>
        <View className="books-classify">OldTestament</View>
        <AtGrid
          data={oldBibles.map((item: any) => ({ value: item.name }))}
          onClick={this.handleClick.bind(this)}
        />
        <View className="books-classify">NewTestament</View>
        <AtGrid
          data={newBibles.map((item: any) => ({ value: item.name, length: item.length }))}
          onClick={this.handleClick.bind(this)}
        />
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
