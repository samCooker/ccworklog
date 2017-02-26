package cn.com.chaochuang;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import org.apache.cordova.CordovaActivity;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Created by Shicx on 2016/6/23.
 */
public class OtherActivity extends CordovaActivity{

  private static final String TAG_OTHER = "otherActivity";

  private static final String USER_NAME="userName";
  private static final String PASSWORD="password";
  private static JSONObject userData = new JSONObject();;

  @Override
  public void onCreate(Bundle savedInstanceState)
  {
    super.onCreate(savedInstanceState);

    Intent data = getIntent();
    String userName = data.getStringExtra(USER_NAME);
    String password = data.getStringExtra(PASSWORD);
    try {
      userData.put(USER_NAME,userName);
      userData.put(PASSWORD,password);
    } catch (JSONException e) {
      e.printStackTrace();
    }

    Log.d(TAG_OTHER,String.format("userName:%s , password: %s",userName,password));
    Log.d(TAG_OTHER,userData.toString());

    loadUrl("file:///android_asset/www/other.html");
  }

  public static JSONObject getUserData(){
    return userData;
  }
}
