import { ComponentType } from 'react'

import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { observer, inject } from '@tarojs/mobx'

import './index.sass'

@inject('counterStore')
@observer
class Index extends Component <any, any>{

  constructor (props) {
    super (props)
    this.state = {
      chapters: {},
      chapter: 1,
      article: [],
    }
  }

  config: Config = {
    navigationBarTitleText: 'chapters'
  }

  componentWillMount () {
    Taro.request({
      method: 'GET',
      url: `https://assets.dianwoda.cn/enochjs/books/bible/${this.$router.params.book}.js`
    }).then(result => {
      const chapter = +this.$router.params.chapter
      const article = result.data[`${this.$router.params.book}-${chapter}`] || []
      this.setState({ chapters: result.data, chapter: chapter, article: article })
    })
  }

  componentWillReact () {
    console.log('componentWillReact')
  }

  onReachBottom = () => {
    this.setState({ chapter: this.state.chapter + 1 })
    const article = this.state.chapters[`${this.$router.params.book}-${this.state.chapter + 1}`] || []
    this.setState({
      article: this.state.article.concat(article),
      chapter: this.state.chapter + 1,
    })
  }

  // handleClick = (event) => {
  //   const timer = new Date().getTime()
  //   clearTimeout(this.rowClick)
  //   this.rowClick = setTimeout(() => {
  //     console.log('click')
  //   }, 300);
  //   if (timer - this.timer < 300) {
  //     console.log('dblClick', event)
  //     clearTimeout(this.rowClick)
  //   }
  //   this.timer = timer
  // }

  render () {

    return (
      <View className='at-article__p'>
        {
          this.state.article.map((item: string, index: number) =>
            <View key={index.toString()} className='at-article__p'>
              <Text selectable={true} className="c-desc" >
                {item}
              </Text>
            </View>)
        }
      </View>
    )
  }
}

export default Index  as ComponentType
