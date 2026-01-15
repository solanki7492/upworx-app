import { Tabs, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@react-navigation/native';

export default function TabLayout() {
  const { colors } = useTheme();
  const { userRole, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const isPartner = userRole === 'PARTNER';

  // Handle redirects based on role
  useEffect(() => {
    if (isLoading) return;

    const inTabs = segments[0] === '(tabs)';

    if (inTabs) {
      const currentTab = segments[1] ?? '';

      // Partner trying to access customer tabs
      if (isPartner && ['index', 'services', 'orders'].includes(currentTab)) {
        router.replace('/(tabs)/leads');
      }

      // Customer trying to access partner tabs
      if (!isPartner && ['leads', 'earnings', 'ledgers'].includes(currentTab)) {
        router.replace('/(tabs)');
      }
    }
  }, [userRole, isLoading, segments, router, isPartner]);

  // Show loading while determining role
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>

      {/* Customer tabs */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          href: isPartner ? null : undefined,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Services',
          href: isPartner ? null : undefined,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="wrench.and.screwdriver.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          href: isPartner ? null : undefined,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet.clipboard.fill" color={color} />,
        }}
      />

      {/* Partner tabs */}
      <Tabs.Screen
        name="leads"
        options={{
          title: 'Leads',
          href: !isPartner ? null : undefined,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.2.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: 'Earnings',
          href: !isPartner ? null : undefined,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="dollarsign.circle.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="ledgers"
        options={{
          title: 'Ledgers',
          href: !isPartner ? null : undefined,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="doc.text.fill" color={color} />,
        }}
      />

      {/* Shared tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}