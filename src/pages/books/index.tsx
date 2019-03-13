import { ComponentType } from 'react'

import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtTabBar, AtMessage } from 'taro-ui'
import { observer, inject } from '@tarojs/mobx'

import contentsEn from '../../config/contentsEn'
import contentsCn from '../../config/contentsCn'

const booksEn = {}
const booksCn = {}

import './index.sass'

@inject('counterStore')
@observer
class Index extends Component <any, any>{

  constructor (props) {
    super (props)
    this.state = {
      chapters: {},
      chapter: 1,
      language: 0,
      isnull: false,
    }
  }

  config: Config = {
    navigationBarTitleText: 'chapters'
  }

  getBook = () => {
    return [
      {
        path: 'english',
        name: contentsEn[this.$router.params.bookIndex || 0].name,
      },
      {
        path: 'chinese',
        name: contentsCn[this.$router.params.bookIndex || 0].name
      }
    ]
  }

  componentWillMount () {
    Promise.all(this.getBook().map((book) => {
      return new Promise((resolve) => {
        const cacheBook = book.path === 'english' ? booksEn[book.name] : booksCn[book.name]
        if (cacheBook) {
          resolve(true)
          return
        }
        Taro.request({
          method: 'GET',
          url: `https://assets.dianwoda.cn/enochjs/books/bible/${book.path}/${book.name}.js`
        }).then(result => {
          book.path === 'english' ? booksEn[book.name] = result.data : booksCn[book.name] = result.data
          resolve(true)
        })
      })

    })).then(() => {
      const bookNameCn = contentsCn[this.$router.params.bookIndex || 0].name
      const chapter = +this.$router.params.chapter
      const articleCn = booksCn[bookNameCn] ? booksCn[bookNameCn][`${bookNameCn}-${chapter}`] : []
      const bookNameEn = contentsEn[this.$router.params.bookIndex || 0].name
      const articleEn = booksEn[bookNameEn] ? booksEn[bookNameEn][`${bookNameEn}-${chapter}`] : []
      this.setState({
        chapter,
        articleCn,
        articleEn,
        touchX: '',
        touchY: '',
      })
    })
  }
  

  handleTabsClick = (type: string, index: number) => {
    this.setState({ [type]: index })
  }

  handleTouchStart = (e) => {
    this.setState({
      touchX: e.changedTouches[0].clientX,
      touchY: e.changedTouches[0].clientY,
    });
  }


  handleTouchEnd = (e) => {
    let x = e.changedTouches[0].clientX;
    let y = e.changedTouches[0].clientY;
    this.JudgeTouchData(x, y, this.state.touchX, this.state.touchY)
  }

  JudgeTouchData = (endX, endY, startX, startY) => {
    if (endX - startX > 50 && Math.abs(endY - startY) < 50) { //右滑
      if (this.state.chapter === 1) {
        Taro.atMessage({
          message: this.state.language === 0 ? 'It is already the first chapter!' : '已经是第一章了！',
          type: 'warning',
          duration: 1000,
        })
        return
      } 
      this.setState({ isnull: true }, () => {
        this.setState({
          chapter: this.state.chapter - 1,
          isnull: false,
        })
      })
    } else if (endX - startX < -50 && Math.abs(endY - startY) < 50) { //左滑
      const length = contentsCn[this.$router.params.bookIndex || 0].length
      if (this.state.chapter === Number(length)) {
        Taro.atMessage({
          message: this.state.language === 0 ? 'Already the last chapter!' : '已经是最后一章了！',
          type: 'warning',
          duration: 1000,
        })
        return
      }
      this.setState({ isnull: true }, () => {
        this.setState({
          chapter: this.state.chapter + 1,
          isnull: false,
        })
      })
    }
  }

  render () {
    const languages = [{ title: '英文' }, { title: '中文' }, { title: '中英' }]
    const bookNameCn = contentsCn[this.$router.params.bookIndex || 0].name
    const articleCn = booksCn[bookNameCn] ? booksCn[bookNameCn][`${bookNameCn}-${this.state.chapter}`] : []
    const bookNameEn = contentsEn[this.$router.params.bookIndex || 0].name
    const articleEn = booksEn[bookNameEn] ? booksEn[bookNameEn][`${bookNameEn}-${this.state.chapter}`] : []
    return (
      <View className="book-detail">
        {
          this.state.isnull ? '' : <View key={`bookNameEn${this.state.chapter}`} className='at-article' onTouchStart={this.handleTouchStart} onTouchEnd={this.handleTouchEnd}>
            {
              articleEn.map((item: string, index: number) =>
                <View key={bookNameEn + index.toString()} className='at-article__p'>
                  {
                    this.state.language !== 1?
                      <View>
                        <Text selectable={true} className="c-desc" >
                          {item}
                        </Text>
                      </View> : null
                  }
                  {
                    this.state.language !== 0 ?
                      <Text selectable={true} className="c-desc" >
                        {articleCn[index]}
                      </Text> : null
                  }
                </View>)
            }
          </View>
        }
        <AtMessage />
        <AtTabBar
          className="book-tab-bar"
          fixed
          current={this.state.language}
          tabList={languages}
          onClick={this.handleTabsClick.bind(this, 'language')}
        />
      </View>
    )
  }
}

export default Index  as ComponentType
