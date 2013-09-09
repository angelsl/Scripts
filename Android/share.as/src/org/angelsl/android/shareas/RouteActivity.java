package org.angelsl.android.shareas;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.res.Resources;
import android.content.res.TypedArray;
import android.database.DataSetObserver;
import android.os.Bundle;
import android.preference.PreferenceActivity;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.MimeTypeMap;
import android.widget.*;

public class RouteActivity extends Activity implements AdapterView.OnItemClickListener, AdapterView.OnItemLongClickListener {
    private ListView _root;
    private MimeAdapter _adapter;

    public void onCreate(Bundle savedInstanceState) {
        _root = new ListView(this);
        _adapter = new MimeAdapter();
        _root.setAdapter(_adapter);
        _root.setOnItemClickListener(this);
        _root.setOnItemLongClickListener(this);
        setContentView(_root);
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
        String result = getResources().getStringArray(R.array.mimetypes)[position];
        if(result.equals("ext")) {
            final EditText input = new EditText(this);
            new AlertDialog.Builder(this).setTitle(R.string.enter_ext).setView(input).setPositiveButton(android.R.string.ok, new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialog, int which) {
                    forward(MimeTypeMap.getSingleton().getMimeTypeFromExtension(input.getText().toString().replaceAll("^\\.", "")));
                }
            }).show();
            return;
        } else if(result.equals("mime")) {
            final EditText input = new EditText(this);
            input.setText(getIntent().getType());
            new AlertDialog.Builder(this).setTitle(R.string.enter_mime).setView(input).setPositiveButton(android.R.string.ok, new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialog, int which) {
                    forward(input.getText().toString().trim());
                }
            }).show();
            return;
        }
        forward(result);
    }

    private void forward(String asMime) {
        Intent sendIntent = getIntent();
        sendIntent.setType(asMime);
        sendIntent.setComponent(null);
        startActivity(Intent.createChooser(sendIntent, null));
        finish();
    }

    @Override
    protected void onStop() {
        super.onStop();
    }

    @Override
    public boolean onItemLongClick(AdapterView<?> parent, View view, int position, long id) {
        Toast.makeText(this, getResources().getStringArray(R.array.mimetypes)[position], Toast.LENGTH_SHORT).show();
        return true;
    }

    private class MimeAdapter extends BaseAdapter {
        @Override
        public View getView(int position, View convertView, ViewGroup parent) {
            Resources res = getResources();
            if(convertView == null)
                convertView = getLayoutInflater().inflate(R.layout.type_item, parent, false);
            ((TextView)convertView.findViewById(R.id.textView)).setText(res.getStringArray(R.array.mimenames)[position]);
            TypedArray icons = res.obtainTypedArray(R.array.mimeicons);
            ((ImageView)convertView.findViewById(R.id.imageView)).setImageDrawable(!icons.getString(position).isEmpty() ? icons.getDrawable(position) : null);

            return convertView;
        }

        @Override
        public int getCount() {
            return getResources().getStringArray(R.array.mimetypes).length;
        }

        @Override
        public String getItem(int position) {
            return getResources().getStringArray(R.array.mimetypes)[position];
        }

        @Override
        public long getItemId(int position) {
            return position;
        }

        @Override
        public boolean hasStableIds() {
            return true;
        }
    }
}