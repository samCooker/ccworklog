package cn.com.chaochuang;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.util.Log;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.List;

/**
 * Created by Shicx on 2016/6/23.
 */
public class StartActivity extends CordovaPlugin {

  private static final String LOG_START_APP = "startApp";

  @Override
  public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
    if ("startActivity".equals(action)) {
      return startActivity(action,args,callbackContext);
    }else if("getIntentData".equals(action)){
      return getIntentData(action,args,callbackContext);
    }

    return false;
  }

  //接收从其他app传递过来的数据
  private boolean getIntentData(String action, JSONArray args, CallbackContext callbackContext) {
    callbackContext.success(OtherActivity.getUserData());
    return false;
  }

  // 启动其他app
  private boolean startActivity(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
    JSONObject data = args.optJSONObject(0);
    String appId = data.optString("appId");
    String userName = data.optString("userName");
    String password = data.optString("password");
    JSONObject result = new JSONObject();

    Log.d(LOG_START_APP, String.format("appId:%s,userName:%s,password:%s", appId, userName, password));

    if (isBlank(appId)) {
      result.put("errorInfo", "应用id号为空");
      callbackContext.error(result);
      return false;
    }
    if (isBlank(userName) || isBlank(password)) {
      result.put("errorInfo", "用户名或密码为空");
      callbackContext.error(result);
      return false;
    }
    Activity activity = this.cordova.getActivity();
    Intent intent = new Intent();
    intent.setAction(appId);
    intent.putExtra("userName", userName);
    intent.putExtra("password", password);
    intent.setType("text/plain");

    //检测是否存在对应的activity
    PackageManager manager = activity.getPackageManager();
    List<ResolveInfo> resolveInfoList = manager.queryIntentActivities(intent, 0);
    Log.d(LOG_START_APP,"list:"+resolveInfoList.size());
    if (resolveInfoList.size() > 0) {
      activity.startActivity(intent);
      return true;
    } else {
      result.put("appExist", 0);
      result.put("errorInfo", "不存在对应的App");
      callbackContext.error(result);
      return false;
    }
  }

  private boolean isBlank(String s) {
    return s == null || "".equals(s.trim());
  }
}
