package org.karapatan.cards;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import org.karapatan.cards.localmultiplayer.LocalMultiplayerPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(LocalMultiplayerPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
