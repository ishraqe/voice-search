import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableHighlight,
  ScrollView,
  TouchableWithoutFeedback,
  Animated,
  ActivityIndicator} from 'react-native';
import Voice from 'react-native-voice';
import tts from 'react-native-android-speech';
import axios from 'axios';
const parseString = require('react-native-xml2js').parseString;

const APPID = '5VLKR7-UH9PL2G8Y6';


class App extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      recognized: '',
      pitch: '',
      error: '',
      end: '',
      started: '',
      results: [],
      data: null,
      content: null,
      tryAgain : false,
      loading : false
    };
    
    Voice.onSpeechStart = this.onSpeechStart.bind(this);
    Voice.onSpeechRecognized = this.onSpeechRecognized.bind(this);
    Voice.onSpeechEnd = this.onSpeechEnd.bind(this);
    Voice.onSpeechError = this.onSpeechError.bind(this);
    Voice.onSpeechResults = this.onSpeechResults.bind(this);
  }

  componentWillUnmount() {
    Voice.destroy().then(Voice.removeAllListeners);
  }


  
  onSpeechStart(e) {
    this.setState({
      started: '√',
    });
  }

  onSpeechRecognized(e) {
    this.setState({
      recognized: '√'
    });
  }
  onSpeechEnd(e) {
    this.setState({
      end: '√'
    });
  }

  onSpeechError(e) {
    this.setState({
      error: JSON.stringify(e.error),
    });
  }

  onSpeechResults(e) {
    this.setState({
      results: e.value,
    });
   if(this.state.results.length > 0) {
     this.setState({
       loading: true
     });
   }
    
  }

  async _startRecognizing(e) {
    this.setState({
      recognized: '',
      pitch: '',
      error: '',
      started: '',
      results: [],
      end: ''
    });
    try {
      await Voice.start('en-US');
    } catch (e) {
      console.error(e);
    }
  }

  async _stopRecognizing(e) {
   
    try {
      await Voice.stop();
      this.setState({
        recognized: '',
        pitch: '',
        error: '',
        end: '',
        started: '',
        results: [],
        data: null,
        content: null
      });
      
      tts.shutDown()
        .then(isStopped => {
          console.log(isStopped);
        })
        .catch(error => {
          console.log(error);
        }); 
    } catch (e) {
      console.error(e);
    }
  }

  async _cancelRecognizing(e) {
    try {
      await Voice.cancel();
      this.setState({
        data:  null,
        content: null
      })
    } catch (e) {
      console.error(e);
    }
  }

  async _destroyRecognizer(e) {
    try {
      await Voice.destroy();
    } catch (e) {
      console.error(e);
    }
    this.setState({
      recognized: '',
      pitch: '',
      error: '',
      started: '',
      results: [],
      end: '',
      data : null,
      content : null
    });
  }


  _result() {
    var that = this;
    try {
      if (this.state.results.length > 0) {
       
        fetch('http://api.wolframalpha.com/v2/query?appid=5VLKR7-UH9PL2G8Y6&input=' + this.state.results[0])
          .then(response => response.text())
          .then((response) => {
             parseString(response, function (err, result) {
               console.log(result);
               if (!result.queryresult.$.success) {
                 this.setState ({
                    tryAgain : true
                 });
               } else if (result.queryresult.$.success) {
                 that.setState({
                   content: result.queryresult.pod,
                   loading: false
                 })
               }
            });
          })
          .catch((err) => {
            console.log('fetch', err)
          });
      }
    } catch (e) {
      console.error(e);
    }
  }
  renderQuestion () {
    if (this.state.results.length > 0) {
     return (
        <Text style={[styles.textColor, styles.question]}>
          {this.state.results[0]} ?
        </Text>
     );
   }
   
    return (
      <Text style={[styles.textColor, styles.question]}>
        Press the button and start speaking.
      </Text>
    );
  }
  renderDesc () {
    if (this.state.loading) {
      return (
        <View style={[styles.answerContainer, {justifyContent: 'center', alignItems:'center'}]}>
          <ActivityIndicator size ={50} color="#ffffff" />
        </View>
      );
    }else {
      if (this.state.content) {
        this.renderVoice();
        return (
          <View style={styles.answerContainer}>
            <Text style={[styles.textColor, styles.answer]} >{this.state.content[1].subpod[0].plaintext}</Text>
            <Text style={[styles.borderHalf, { borderBottomColor: '#567DE5' }]}>c</Text>
          </View>
        );
      }else if (this.state.tryAgain) {
        return (
          <View style={styles.answerContainer}>
            <Text style={[styles.textColor, styles.answer]} >No results found !!</Text>
            <Text style={[styles.borderHalf, { borderBottomColor: '#567DE5' }]}>c</Text>
          </View>
        );
      }
    }

  }

  renderVoice = () => {
    if (this.state.content) {
      tts.speak({
        text: this.state.content[1].subpod[0].plaintext.toString(), // Mandatory
        language: 'en', 
        country: 'US' 
      }).then(isSpeaking => {  
        console.log(this.state.isSpeaking);
      }).catch(error => {
        console.log(error)
      });
    }else if (this.state.tryAgain) {
      tts.speak({
        text:'No results found !!, please try again', // Mandatory
        language: 'en',
        country: 'US'
      }).then(isSpeaking => {
        console.log(this.state.isSpeaking);
      }).catch(error => {
        console.log(error)
      });
    }
  } 
  renderStartStopButton = () => {
    if (this.state.started === '√') {
      return (
        <TouchableHighlight onPress={this._stopRecognizing.bind(this)}>
          <View
            style={styles.buttonWrapper}>
            <Image
              style={{ height: 24, width: 24 }}
              source={require('./assets/microphone.png')}
            />
          </View>
        </TouchableHighlight>
      );
    }
    return (
      <TouchableHighlight onPress={this._startRecognizing.bind(this)}>
        <View
          style={styles.buttonStopWrapper}>
          <Image
            style={{ height: 24, width: 24 }}
            source={require('./assets/microphone.png')}
          />
        </View>
      </TouchableHighlight>
    );
  }

  render() {    
    return (
      <View style={styles.container}>
        <View style={styles.questionContainer}>
          {this.renderQuestion()}
          <Text style={styles.borderHalf}>c</Text>
        </View>
          {this.renderDesc()}
        <View style={styles.buttonContainer}>
          {this.renderStartStopButton()}
          {this._result()}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
 
  container: {
    height: '100%',
    width:'100%',
    backgroundColor: '#1B2B43',   
  },
  questionContainer: {
    flex: 1,
    alignItems: 'flex-end',
    paddingRight: 20,
    paddingTop: 20,
    paddingLeft: 20
  },
  question: {
    fontSize : 30,
    fontWeight: "100",
  },
  answer : {
    fontSize: 35,
    fontWeight: "200",
  },
  borderHalf : {
    color: 'transparent',
    width: 100,
    borderBottomWidth:  3,
    borderBottomColor: '#C4D3F8'
  },
  answerContainer : {
    flex: 1,
    alignItems: 'flex-start',
    paddingLeft: 20,
    paddingTop: 20,
  },
  waveContainer : {
    flex: 1
  },
  buttonContainer : {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 20
  },
  buttonWrapper : {
    height: 50,
    width: 50,
    borderRadius : 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C70065'
  },
  buttonStopWrapper: {
    height: 50,
    width: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'green'
  },
  button: {
    width: 50,
    height: 50,
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  action: {
    textAlign: 'center',
    color: '#0000FF',
    marginVertical: 5,
    fontWeight: 'bold',
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  stat: {
    textAlign: 'center',
    color: '#B0171F',
    marginBottom: 1,
  },
  textColor : {
    color: '#BDC4D6'
  },
  wave : {
    height: 1,
    width: '100%',
    backgroundColor: '#fff',
    opacity: .4,
    position: 'absolute',
    top: 3 ,
  }
});


export default App;