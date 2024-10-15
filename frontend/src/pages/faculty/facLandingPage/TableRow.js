import React from 'react';
import { Link, useParams } from 'react-router-dom';
import viewicon from '../../photos-logos/view.jpeg';
import editicon from '../../photos-logos/edit.png';
import './TableRow.css';

const TableRow = ({ row }) => {

  const { branch } = useParams();
  return (
    <tbody className='tbody-tablerow'>
      <tr className='tr-tablerow'>
        <td>{row.termYear}</td>
        <td>
          <button>
            <Link to={`/faculty/${branch}/${row._id}/facView`}>
              <img src={viewicon} alt="view-logo" />
            </Link>
          </button>
        </td>
        <td>
          <button>
            <Link to={`/faculty/${branch}/${row._id}/edit/facAddStudent`}>
              <img src={editicon} alt="edit-logo" />
            </Link>
          </button>
        </td>
      </tr>
    </tbody>
  );
};

export default TableRow;
