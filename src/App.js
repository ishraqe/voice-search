import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableHighlight,
  ScrollView,
  TouchableWithoutFeedback,
  Animated} from 'react-native';
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
      enableRec : false
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
      recognized: '√',
    });
  }

  onSpeechEnd(e) {
    this.setState({
      end: '√',
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
  }

  async _startRecognizing(e) {
    this.setState({
      recognized: '',
      pitch: '',
      error: '',
      started: '',
      results: [],
      partialResults: [],
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
        data: null,
        content: null
      })
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
               that.setState({
                 content: result.queryresult.pod
               })
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

  renderDesc () {
    if (this.state.content) {
      this.renderVoice();
      return (
        <Text style={styles.instructions}>{this.state.content[1].subpod[0].plaintext}</Text>
      );
    }
  }

  renderVoice = () => {
    if (this.state.content) {
      setTimeout(() => {
        tts.speak({
          text: this.state.content[1].subpod[0].plaintext.toString(), // Mandatory
          language: 'en', // Optional Paramenter Default is en you can provide any supported lang by TTS
          country: 'US' // Optional Paramenter Default is null, it provoques that system selects its default
        }).then(isSpeaking => {
          //Success Callback
          console.log(isSpeaking);
        }).catch(error => {
          //Errror Callback
          console.log(error)
        });
      }, 500);
    }
  } 

  render() {    
    return (
      <View style={styles.container}>
        <View style={styles.questionContainer}>
            <Text style={[styles.textColor, styles.question]}>
              What is fear ?
            </Text>
          <Text style={styles.borderHalf}>c</Text>
        </View>
        <View style={styles.answerContainer}>
          <Text style={[styles.textColor, styles.answer]} >Fear is the path to the dark side</Text>
          <Text style={[styles.borderHalf, { borderBottomColor: '#567DE5'}]}>c</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableHighlight onPress={this._startRecognizing.bind(this)}>
            <View 
            style={styles.buttonWrapper}>
              <Image
                style={{height: 24, width: 24}}
                source={require('./assets/microphone.png')}
              />
            </View>
          </TouchableHighlight>
        </View>

      {/* {this.renderDesc()}
        <Text style={styles.instructions}>
          Press the button and start speaking.
        </Text>
        <Text style={styles.stat}> {this.state.results[0]} </Text>
        <TouchableHighlight onPress={this._startRecognizing.bind(this)}>
          <Text style={styles.action}> 
            Start
          </Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={this._stopRecognizing.bind(this)}>
          <Text
            style={styles.action}>
            Stop Recognizing
          </Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={this._cancelRecognizing.bind(this)}>
          <Text
            style={styles.action}>
            Cancel
          </Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={this._destroyRecognizer.bind(this)}>
          <Text
            style={styles.action}>
            Destroy
          </Text>
        </TouchableHighlight>
        {this._result()} */}
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
    width: 60,
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