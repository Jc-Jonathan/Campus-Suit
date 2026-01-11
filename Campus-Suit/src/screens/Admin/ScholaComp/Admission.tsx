import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

const API_URL = 'http://192.168.31.130:5000/api/scholarshipApplications';

const Admission = () => {
  const [apps, setApps] = useState<any[]>([]);

  const fetchApps = () => {
    axios.get(API_URL).then(res => setApps(res.data));
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const approved = apps.filter(a => a.status === 'approved');
  const rejected = apps.filter(a => a.status === 'rejected');

  const deleteApplication = (id: string) => {
    Alert.alert(
      'Delete Application',
      'Are you sure you want to permanently delete this application?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await axios.delete(`${API_URL}/${id}`);
            fetchApps(); // refresh table
          },
        },
      ]
    );
  };

  const TableHeader = () => (
    <View style={styles.headerRow}>
      <Text style={[styles.headerCell, styles.wide]}>Full Name</Text>
      <Text style={styles.headerCell}>Country</Text>
      <Text style={[styles.headerCell, styles.wide]}>Email</Text>
      <Text style={styles.headerCell}>Phone</Text>
      <Text style={styles.headerCell}>Program</Text>
      <Text style={styles.headerCell}>Action</Text>
    </View>
  );

  const renderRow = ({ item }: any) => (
    <View style={styles.row}>
      <Text style={[styles.cell, styles.wide]}>{item.fullName}</Text>
      <Text style={styles.cell}>{item.country}</Text>
      <Text style={[styles.cell, styles.wide]}>{item.email}</Text>
      <Text style={styles.cell}>
        {item.countryCode}{item.phoneLocal}
      </Text>
      <Text style={styles.cell}>{item.program}</Text>

      {/* ACTION COLUMN */}
      <TouchableOpacity
        style={styles.actionCell}
        onPress={() => deleteApplication(item._id)}
      >
        <MaterialIcons name="delete" size={22} color="red" />
      </TouchableOpacity>
    </View>
  );

  const Table = ({ data }: any) => (
    <ScrollView horizontal showsHorizontalScrollIndicator>
      <View>
        <TableHeader />
        <FlatList
          data={data}
          renderItem={renderRow}
          keyExtractor={(item) => item._id}
        />
      </View>
    </ScrollView>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titleApproved}>Approved</Text>
      <Table data={approved} />

      <Text style={styles.titleRejected}>Rejected</Text>
      <Table data={rejected} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginLeft: -20,
    marginRight: -23,
    backgroundColor: '#f4f6f8',
  },

  titleApproved: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 12,
    alignSelf: 'center',
  },

  titleRejected: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#c62828',
    marginTop: 30,
    marginBottom: 12,
    alignSelf: 'center',
  },

  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#90caf9',
  },

  headerCell: {
    width: 140,
    fontWeight: 'bold',
    fontSize: 13,
    color: '#333',
    paddingHorizontal: 10,
  },

  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
    alignItems: 'center',
  },

  cell: {
    width: 140,
    fontSize: 12,
    color: '#333',
    paddingHorizontal: 5,
  },

  wide: {
    width: 240,
  },

  actionCell: {
    width: 80,
    alignItems: 'center',
  },
});

export default Admission;
