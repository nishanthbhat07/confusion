import React,{Component } from 'react';
import {View,FlatList,StyleSheet,ScrollView,Text,Button,Modal,Share,Alert,PanResponder} from 'react-native';
import {Card, Icon,Input} from 'react-native-elements';
import {Rating} from 'react-native-ratings';
import {postFavorite,postComment} from '../redux/ActionCreators';
import {connect} from 'react-redux';
import {baseUrl} from '../shared/baseUrl';
import * as Animatable from 'react-native-animatable';


const mapStateToProps=state=>{
    return{
        dishes:state.dishes,
        comments:state.comments,
        favorites:state.favorites
    }
}

const mapDispatchToProps=dispatch=>({
    postFavorite:(dishId)=>dispatch(postFavorite(dishId)),
    postComment: (dishId,rating,author,comment)=>dispatch(postComment(dishId,rating,author,comment))

});
function RenderDish(props){
    const dish=props.dish;

    
   handleViewRef = ref => this.view = ref;
    const recognizeDrag=({moveX,moveY,dx,dy})=>{
        if(dx<-200){
            return true;
        }
        else
        return false;

    };
    const recognizeComment=({moveX,moveY,dx,dy})=>{
        if(dx>200){
            return true;
        }
        else
        return false;

    };


    const panResponder=PanResponder.create({
        onStartShouldSetPanResponder: (e,gestureState)=>{
            return true;
        },
        onPanResponderGrant:()=>{
            this.view.rubberBand(1000)
            .then(endState=>console.log(endState.finished? 'finished' : 'cancelled'));
        },
        onPanResponderEnd: (e,gestureState)=>{
            if(recognizeDrag(gestureState)){
                Alert.alert(
                    'Add to Favorites?',
                    'Are you sure you wish to add '+ dish.name+' to your favorites',
                    [
                        {
                            text:'Cancel',
                            onPress: ()=> console.log('Cancel pressed'),
                            style:'cancel'
                        },
                        {
                            text:'OK',
                            onPress: ()=> props.favorite ? console.log('Already favorite'):props.onPress(),

                        }
                    ] , 
                    {cancelable:false}
                );
                return true;
            }
            else if(recognizeComment(gestureState)){
               props.toggleModal();
            }
        }
    });
    const shareDish=(title,message,url)=>{
        Share.share({
            title:title,
            message: title+': '+message+' '+url,
            url:url
        },
        {
            dialogTitle : 'Share'+title
        }
        );
    }

    if(dish!=null){
        return(
            <Animatable.View animation="fadeInDown" duration={2000} delay={1000}
            ref={this.handleViewRef} {...panResponder.panHandlers}
            >
            <Card featuredTitle={dish.name} 
            image={{uri:baseUrl+dish.image}}>
                <Text style={{margin: 10}}>
                    {dish.description}
                </Text>
                <View style={{flexDirection:'row',justifyContent:'center'}}>
                  <Icon raised reverse iconStyle={{justifyContent:'center'}} name={props.favorite ? 'heart' : 'heart-o'} type='font-awesome'
                color='#f50'
                onPress={()=> props.favorite ? console.log('Already favorite'):props.onPress()}
                />
                
               
                
                <Icon raise iconStyle={{justifyContent:'center'}} reverse name='pencil' color='#512DA8' type='font-awesome'
                onPress={()=>props.toggleModal() }
                />  
                <Icon raise reverse
                name='share'
                type="font-awesome"
                color='#51D2A8'
                
                onPress={()=>shareDish(dish.name,dish.description,baseUrl+dish.image)}
                />
                </View>
                
                
            </Card>
            </Animatable.View>
        );
    }
    else{
        return(
            <View>

            </View>
        );
    }


}
function RenderComments(props){
    const comments=props.comments;
    const renderCommentItem=({item,index})=>{
        return(
            <View key={index} style={{margin:10}}>
                <Text style={{fontSize:14}}>{item.comment}</Text>
                <View style={{alignItems:'flex-start'}}>
                  <Rating imageSize={10} readonly startingValue={item.rating}/>  
                </View>
                
        <Text style={{fontSize:12}}>{'--'+item.author+', '+item.date}</Text> 


            </View>
        );
    }
    return(
        <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>
        <Card title="Comments">
            <FlatList data={comments} renderItem={renderCommentItem} 
            keyExtractor={item=> item.id.toString()}
            />

        </Card>
        </Animatable.View>
    );
}

class DishDetail extends Component {
   constructor(props){
       super(props);
       this.state={
           rating: 0,
           author: '',
           comment:'',
        showModal:false
       }
       this.toggleModal=this.toggleModal.bind(this);
       this.ratingCompleted=this.ratingCompleted.bind(this);
       this.handleComment=this.handleComment.bind(this);
   }
   toggleModal(){
    this.setState({showModal:!this.state.showModal});
}
ratingCompleted(rating){
    this.setState({rating:rating});
}
handleComment(dishId){
    
    console.log(JSON.stringify(this.state));
    this.toggleModal();
    this.props.postComment(dishId, this.state.rating, this.state.author, this.state.comment);
}
    markFavorite(dishId){
       this.props.postFavorite(dishId);
    }
    static navigationOptions={
        title:'Dish Details'
    }
    render(){
        const dishId=this.props.navigation.getParam('dishId','');

      return(
          <ScrollView>
            <RenderDish dish={this.props.dishes.dishes[+dishId]} 
            favorite={this.props.favorites.some(el=> el===dishId)}
            onPress={()=>this.markFavorite(dishId)}
            toggleModal={this.toggleModal}
            /> 
            <RenderComments comments={this.props.comments.comments.filter((comment)=>comment.dishId==dishId)}/> 
            <Modal animationType={'slide'}
                transparent={false}
                visible={this.state.showModal}
                onDismiss={()=>{this.toggleModal()}}
                onRequestClose={()=>{this.toggleModal()}}
            >
                <View style={styles.modal}>
                    
                        
                    <Rating
                        showRating
                        ratingCount={5}
                        style={{ paddingVertical: 10 }}
                        startingValue={this.state.rating}
                        onFinishRating={this.ratingCompleted}
                    />
                    
                       <Input
                       
                       value={this.state.author}
                      
                        leftIcon={
                            <Icon name='user-o' type="font-awesome" size={24} containerStyle={{margin:10}}
                        />
                        }
                        placeholder="Author"
                        onChangeText={text => this.setState({author:text})}
                    />
                   
                       
                        <Input 
                       
                         value={this.state.comment}
                         onChangeText={(comment)=>this.setState({comment:comment})}
                        leftIcon={
                            <Icon name='comment-o' type='font-awesome' size={24} containerStyle={{margin:10}}/>
                        }
                        placeholder="Comment"
                        />
                        <View style={{padding:10}}>
                           <Button title='Submit' raised onPress= {()=>this.handleComment(dishId)}
                        color='#512DA8' /> 
                        </View>
                        <View>
                           <Button title='Cancel' raised onPress={()=>{this.toggleModal();}}
                        color='#ADAAB5' /> 
                        </View>
                        
                    

                </View>

            </Modal>
          </ScrollView>
        
    );  
    }
    
}
const styles=StyleSheet.create({
    formRow:{
        alignItems:'center',
        justifyContent:'center',
        flex:1,
        flexDirection:'row',
        margin:20
    },
    formLabel:{
        fontSize:18,
        flex:2
    },
    formItem:{
        flex:1
    },
    modal:{
        justifyContent:'center',
        margin: 20
    },
    modalTitle:{
        fontSize:24,
        fontWeight:'bold',
        backgroundColor:'#512DA8',
        textAlign:'center',
        color:'white',
        marginBottom:20


    },
    modalText:{
        fontSize:18,
        margin:10
    }
});
export default connect(mapStateToProps,mapDispatchToProps)(DishDetail);
