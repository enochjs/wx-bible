import { ComponentType } from 'react'

import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
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
      language: 1,
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
      Taro.setNavigationBarTitle({ title: `chapter${chapter}` })
    })
    const index = Taro.getStorageSync('language')
    this.setState({ language: index !== undefined ? Number(index) : 1 })
  }
  

  handleTabsClick = (type: string, index: number) => {
    this.setState({ [type]: index })
    Taro.setStorage({ key: 'language', data: index })
  }

  handleTouchStart = (e) => {
    this.setState({
      touchX: e.changedTouches[0].clientX,
      touchY: e.changedTouches[0].clientY,
      startTime: new Date().getTime(),
    });
  }


  handleTouchEnd = (e) => {
    const endTime = new Date().getTime()
    if (endTime - this.state.startTime > 500) {
      return
    }
    let x = e.changedTouches[0].clientX;
    let y = e.changedTouches[0].clientY;
    this.JudgeTouchData(x, y, this.state.touchX, this.state.touchY)
  }

  goToPrePage = () => {
    if (this.state.chapter === 1) {
      Taro.atMessage({
        message: this.state.language === 0 ? 'It is already the first chapter!' : '已经是第一章了！',
        type: 'warning',
        duration: 1000,
      })
      return
    } 
    this.setState({
      chapter: this.state.chapter - 1,
      isnull: false,
    }, () => {
      Taro.setNavigationBarTitle({ title: `chapter${this.state.chapter}` })
    })
  }

  goToNextPage = () => {
    const length = contentsCn[this.$router.params.bookIndex || 0].length
    if (this.state.chapter === Number(length)) {
      Taro.atMessage({
        message: this.state.language === 0 ? 'Already the last chapter!' : '已经是最后一章了！',
        type: 'warning',
        duration: 1000,
      })
      return
    }
    this.setState({
      chapter: this.state.chapter + 1,
      isnull: false,
    }, () => {
      Taro.setNavigationBarTitle({ title: `chapter${this.state.chapter}` })
    })
  }

  JudgeTouchData = (endX, endY, startX, startY) => {
    const widowWidth = Taro.getSystemInfoSync().windowWidth
    if (Math.abs(endY - startY) < 5 && Math.abs(endX - startX) < 5) {
      if (startX < widowWidth / 2 && endX < widowWidth / 2) {
        this.goToPrePage()
      } else if (endX > widowWidth / 2 && startX > widowWidth / 2) {
        this.goToNextPage()
      }
    }
  }

  render () {
    const languages = [{ title: '英文' }, { title: '中文' }, { title: '中英' }]
    const bookNameCn = contentsCn[this.$router.params.bookIndex || 0].name
    const bookNameEn = contentsEn[this.$router.params.bookIndex || 0].name
    const bookEn = booksEn[bookNameEn] || {}
    const bookCn = booksCn[bookNameCn] || {}
    return (
      <View className="book-detail">
        {
          Object.keys(bookEn).map((chapter, chapterIndex) => {
            const show = chapterIndex + 1 === this.state.chapter
            return (
              <ScrollView
                key={`bookNameEn${chapterIndex}`}
                className={show ? 'at-article active' : ''}
                onTouchStart={this.handleTouchStart}
                onTouchEnd={this.handleTouchEnd}
                scrollY
              >
                {
                  show ? bookEn[`${bookNameEn}-${chapterIndex + 1}`].map((item: string, index: number) => {
                    return <View key={bookNameEn + index.toString()} className='at-article__p'>
                      {
                        this.state.language !== 1?
                          <Text selectable={true} className="c-desc" >
                            {item}
                          </Text>
                          : null
                      }
                      {
                        this.state.language !== 0 ?
                          <View>
                            <Text selectable={true} className="c-desc" >
                              {bookCn[`${bookNameCn}-${chapterIndex + 1}`][index]}
                            </Text>
                          </View>: null
                      }
                  </View>}) : null
                }
              </ScrollView>
            )
          })
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
